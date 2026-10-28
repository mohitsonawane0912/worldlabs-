import * as THREE from 'three';

/**
 * Procedural texture generation using HTML5 Canvas to eliminate external image dependencies.
 */

export function createEarthTexture(seaLevel: number = 0, aridity: number = 0.5): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep oceanic base
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGrad.addColorStop(0, '#103058');
  oceanGrad.addColorStop(0.5, '#0b203c');
  oceanGrad.addColorStop(1, '#103058');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Continent colors based on aridity/health
  const landGreen = aridity > 0.6 ? '#6d5a37' : aridity < 0.3 ? '#236e38' : '#3d7842';
  const highlandBrown = aridity > 0.6 ? '#8b7348' : '#5c5234';
  const iceWhite = '#eaf5ff';

  // Draw procedural continental landmasses with noise-like blobs
  function drawLandmass(cx: number, cy: number, rx: number, ry: number, color: string) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    const steps = 36;
    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const noise = 0.75 + Math.sin(angle * 5) * 0.15 + Math.cos(angle * 3) * 0.1;
      const r_mod = 1 - (seaLevel / 100) * 0.35; // Sea level shrinks/expands continents
      const x = cx + Math.cos(angle) * rx * noise * Math.max(0.2, r_mod);
      const y = cy + Math.sin(angle) * ry * noise * Math.max(0.2, r_mod);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // North America & South America
  drawLandmass(260, 160, 140, 95, landGreen);
  drawLandmass(250, 150, 75, 45, highlandBrown);
  drawLandmass(340, 340, 95, 120, landGreen);
  drawLandmass(320, 330, 45, 60, highlandBrown);

  // Eurasia & Africa
  drawLandmass(620, 165, 190, 95, landGreen);
  drawLandmass(680, 140, 100, 50, highlandBrown);
  drawLandmass(580, 300, 110, 110, landGreen);
  drawLandmass(590, 260, 70, 40, aridity > 0.4 ? '#9c7b45' : landGreen); // Sahara

  // Australia & Islands
  drawLandmass(840, 360, 85, 65, aridity > 0.4 ? '#916335' : landGreen);

  // Polar ice caps (affected by temperature indirectly passed or normal)
  ctx.fillStyle = iceWhite;
  ctx.beginPath();
  ctx.ellipse(canvas.width / 2, 20, canvas.width / 2, 35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(canvas.width / 2, canvas.height - 25, canvas.width / 2, 45, 0, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function createCloudsTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';

  // Draw procedural swirling bands of clouds
  for (let y = 60; y < canvas.height - 60; y += 40) {
    const bandNoise = Math.sin(y * 0.05) * 50;
    for (let x = 0; x < canvas.width; x += 30) {
      if (Math.sin(x * 0.02 + y * 0.03) > 0.15) {
        ctx.beginPath();
        const rad = 25 + Math.cos(x * 0.05) * 15;
        ctx.arc(x + bandNoise, y, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function createCityNightLightsTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Clusters of golden amber lights on continents
  ctx.fillStyle = '#ffdf80';
  const centers = [
    [260, 160], [290, 140], [340, 320], [600, 150], [650, 170],
    [720, 190], [800, 200], [840, 360],
  ];

  centers.forEach(([cx, cy]) => {
    for (let i = 0; i < 180; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 55;
      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist;
      const r = Math.random() * 1.5 + 0.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

export function createBuildingFacadeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Glowing grid windows
  ctx.fillStyle = '#38bdf8';
  const cols = 8;
  const rows = 24;
  const w = 18;
  const h = 10;
  const gapX = 14;
  const gapY = 11;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() > 0.25) {
        // Vary window hues (cyan, warm amber, white)
        ctx.fillStyle = Math.random() > 0.3 ? '#38bdf8' : '#fef08a';
        ctx.fillRect(15 + c * (w + gapX), 20 + r * (h + gapY), w, h);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createMarsTerrainTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Martian ochre rust gradient
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#8f3319');
  grad.addColorStop(0.5, '#b44723');
  grad.addColorStop(1, '#66220f');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Craters and dune ripples
  ctx.fillStyle = 'rgba(70, 20, 10, 0.4)';
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = Math.random() * 30 + 8;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Crater rim highlight
    ctx.strokeStyle = 'rgba(235, 130, 80, 0.3)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x - 2, y - 2, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}
