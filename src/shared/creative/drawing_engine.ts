// BlueSTEAM v2 Living Ocean 2D Crayon Drawing & Stamping Engine
// Authentic wax crayon stippling, flood fill, marine stamps, and state management

export type DrawingTool = 'brush' | 'eraser' | 'bucket' | 'stamp';

export type MarineStampType = 'starfish' | 'shell' | 'bubble' | 'coral' | 'turtle' | 'fish';

export interface Point {
  x: number;
  y: number;
}

// Draw authentic wax crayon texture stroke
export function drawCrayonStroke(
  ctx: CanvasRenderingContext2D,
  p1: Point,
  p2: Point,
  color: string,
  brushSize: number
) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dist = Math.hypot(dx, dy);
  const steps = Math.max(1, Math.floor(dist / 1.5));

  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  // Undercoat: faint velvety core line
  ctx.lineWidth = Math.max(1, brushSize * 0.45);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = 0.28;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();

  // Waxy stipple particles deposited on tooth of paper
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const cx = p1.x + dx * t;
    const cy = p1.y + dy * t;
    
    const count = Math.max(3, Math.floor(brushSize * 1.6));
    for (let j = 0; j < count; j++) {
      const angle = Math.random() * Math.PI * 2;
      // Polar distribution weighted towards center with paper grain jitter
      const r = Math.pow(Math.random(), 0.7) * (brushSize * 0.55);
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;
      const radius = 0.6 + Math.random() * 1.2;

      ctx.globalAlpha = 0.18 + Math.random() * 0.55;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

// Clean eraser stroke restoring paper surface or clearing pixels
export function drawEraserStroke(
  ctx: CanvasRenderingContext2D,
  p1: Point,
  p2: Point,
  eraserSize: number
) {
  ctx.save();
  ctx.lineWidth = eraserSize * 1.8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#FAF7F0'; // Paper background ivory tint
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
  ctx.restore();
}

// Draw marine stamp onto canvas
export function drawMarineStamp(
  ctx: CanvasRenderingContext2D,
  center: Point,
  stampType: MarineStampType,
  color: string,
  sizeMultiplier = 1
) {
  ctx.save();
  ctx.translate(center.x, center.y);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const baseScale = 32 * sizeMultiplier;

  switch (stampType) {
    case 'starfish': {
      // 5-pointed ocean starfish
      ctx.beginPath();
      const points = 5;
      const outerR = baseScale;
      const innerR = baseScale * 0.42;
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.stroke();
      break;
    }
    case 'bubble': {
      // Shimmering ocean bubble
      ctx.beginPath();
      ctx.arc(0, 0, baseScale * 0.8, 0, Math.PI * 2);
      ctx.globalAlpha = 0.25;
      ctx.fill();
      ctx.globalAlpha = 0.85;
      ctx.stroke();
      // Highlight arc
      ctx.beginPath();
      ctx.arc(-baseScale * 0.25, -baseScale * 0.25, baseScale * 0.35, Math.PI * 1.1, Math.PI * 1.7);
      ctx.stroke();
      break;
    }
    case 'shell': {
      // Fan seashell
      ctx.beginPath();
      ctx.arc(0, baseScale * 0.5, baseScale * 0.9, Math.PI * 1.15, Math.PI * 1.85);
      ctx.lineTo(0, baseScale * 0.5);
      ctx.closePath();
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.stroke();
      // Ribs
      for (let a = -0.35; a <= 0.35; a += 0.18) {
        ctx.beginPath();
        ctx.moveTo(0, baseScale * 0.5);
        ctx.lineTo(Math.sin(a) * baseScale * 0.85, -Math.cos(a) * baseScale * 0.85 + baseScale * 0.5);
        ctx.stroke();
      }
      break;
    }
    case 'coral': {
      // Branching coral twig
      ctx.beginPath();
      ctx.moveTo(0, baseScale);
      ctx.lineTo(0, 0);
      ctx.lineTo(-baseScale * 0.6, -baseScale * 0.5);
      ctx.moveTo(0, -baseScale * 0.2);
      ctx.lineTo(baseScale * 0.6, -baseScale * 0.7);
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -baseScale);
      ctx.lineWidth = 6;
      ctx.stroke();
      break;
    }
    case 'turtle': {
      // Cute stylized sea turtle
      // Shell
      ctx.beginPath();
      ctx.ellipse(0, 0, baseScale * 0.8, baseScale * 0.6, 0, 0, Math.PI * 2);
      ctx.globalAlpha = 0.9;
      ctx.fill();
      ctx.stroke();
      // Head
      ctx.beginPath();
      ctx.arc(baseScale * 0.9, 0, baseScale * 0.3, 0, Math.PI * 2);
      ctx.fill();
      // Flippers
      ctx.beginPath();
      ctx.ellipse(baseScale * 0.4, -baseScale * 0.6, baseScale * 0.45, baseScale * 0.2, -Math.PI / 4, 0, Math.PI * 2);
      ctx.ellipse(baseScale * 0.4, baseScale * 0.6, baseScale * 0.45, baseScale * 0.2, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'fish': {
      // Little ocean fish
      ctx.beginPath();
      ctx.ellipse(0, 0, baseScale * 0.75, baseScale * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      // Tail fin
      ctx.beginPath();
      ctx.moveTo(-baseScale * 0.6, 0);
      ctx.lineTo(-baseScale * 1.1, -baseScale * 0.5);
      ctx.lineTo(-baseScale * 1.1, baseScale * 0.5);
      ctx.closePath();
      ctx.fill();
      break;
    }
  }

  ctx.restore();
}

// Flood fill algorithm for bucket tool
export function floodFill(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillColorHex: string,
  width: number,
  height: number
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Convert hex to rgb
  const cleanHex = fillColorHex.replace('#', '');
  const rFill = parseInt(cleanHex.slice(0, 2), 16);
  const gFill = parseInt(cleanHex.slice(2, 4), 16);
  const bFill = parseInt(cleanHex.slice(4, 6), 16);
  const aFill = 255;

  const startIndex = (startY * width + startX) * 4;
  const rTarget = data[startIndex];
  const gTarget = data[startIndex + 1];
  const bTarget = data[startIndex + 2];
  const aTarget = data[startIndex + 3];

  // Already matching
  if (
    Math.abs(rTarget - rFill) < 12 &&
    Math.abs(gTarget - gFill) < 12 &&
    Math.abs(bTarget - bFill) < 12
  ) {
    return;
  }

  // Avoid filling over dark template lines
  if (rTarget < 60 && gTarget < 60 && bTarget < 60 && aTarget > 200) {
    return;
  }

  const tolerance = 48;
  const matchTarget = (idx: number) => {
    return (
      Math.abs(data[idx] - rTarget) <= tolerance &&
      Math.abs(data[idx + 1] - gTarget) <= tolerance &&
      Math.abs(data[idx + 2] - bTarget) <= tolerance &&
      Math.abs(data[idx + 3] - aTarget) <= tolerance
    );
  };

  const queue: number[] = [startX, startY];
  const visited = new Uint8Array(width * height);
  visited[startY * width + startX] = 1;

  while (queue.length > 0) {
    const cy = queue.pop()!;
    const cx = queue.pop()!;
    const idx = (cy * width + cx) * 4;

    data[idx] = rFill;
    data[idx + 1] = gFill;
    data[idx + 2] = bFill;
    data[idx + 3] = aFill;

    const neighbors = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1],
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nPos = ny * width + nx;
        if (!visited[nPos]) {
          visited[nPos] = 1;
          const nIdx = nPos * 4;
          if (matchTarget(nIdx)) {
            queue.push(nx, ny);
          }
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
}
