import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Full SVG
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0369a1" />
    </linearGradient>
    <linearGradient id="boneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#e2e8f0" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.35" />
    </filter>
  </defs>

  <rect width="512" height="512" rx="110" fill="url(#bg)" />

  <circle cx="256" cy="256" r="195" fill="none" stroke="#38bdf8" stroke-width="4" stroke-opacity="0.3" stroke-dasharray="12 8" />

  <g filter="url(#shadow)" transform="translate(256, 256) scale(1.1) translate(-256, -256)">
    <rect x="238" y="120" width="36" height="272" rx="18" fill="url(#boneGrad)" />
    <circle cx="236" cy="135" r="24" fill="url(#boneGrad)" />
    <circle cx="276" cy="135" r="24" fill="url(#boneGrad)" />
    <circle cx="236" cy="377" r="24" fill="url(#boneGrad)" />
    <circle cx="276" cy="377" r="24" fill="url(#boneGrad)" />

    <rect x="156" y="210" width="200" height="34" rx="17" fill="url(#boneGrad)" opacity="0.95" />
    <circle cx="156" cy="227" r="20" fill="url(#boneGrad)" />
    <circle cx="356" cy="227" r="20" fill="url(#boneGrad)" />

    <circle cx="256" cy="227" r="28" fill="#0284c7" />
    <circle cx="256" cy="227" r="16" fill="#38bdf8" />

    <path d="M 285 275 L 345 335 Q 355 345 345 355 L 335 365 Q 325 375 315 365 L 265 315 Z" fill="#38bdf8" opacity="0.9" />
  </g>

  <text x="256" y="440" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="800" fill="#ffffff" letter-spacing="2">ORTHOLOG</text>
</svg>`;

// Maskable icon with full bleed and extra 15% safe padding
const maskableSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0369a1" />
    </linearGradient>
    <linearGradient id="boneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#e2e8f0" />
    </linearGradient>
  </defs>

  <!-- Full-bleed background for maskable -->
  <rect width="512" height="512" fill="url(#bg)" />

  <!-- Content scaled inside safe-zone (80% circle) -->
  <g transform="translate(256, 256) scale(0.78) translate(-256, -256)">
    <rect x="238" y="120" width="36" height="272" rx="18" fill="url(#boneGrad)" />
    <circle cx="236" cy="135" r="24" fill="url(#boneGrad)" />
    <circle cx="276" cy="135" r="24" fill="url(#boneGrad)" />
    <circle cx="236" cy="377" r="24" fill="url(#boneGrad)" />
    <circle cx="276" cy="377" r="24" fill="url(#boneGrad)" />

    <rect x="156" y="210" width="200" height="34" rx="17" fill="url(#boneGrad)" opacity="0.95" />
    <circle cx="156" cy="227" r="20" fill="url(#boneGrad)" />
    <circle cx="356" cy="227" r="20" fill="url(#boneGrad)" />

    <circle cx="256" cy="227" r="28" fill="#0284c7" />
    <circle cx="256" cy="227" r="16" fill="#38bdf8" />

    <path d="M 285 275 L 345 335 Q 355 345 345 355 L 335 365 Q 325 375 315 365 L 265 315 Z" fill="#38bdf8" opacity="0.9" />
    <text x="256" y="440" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="800" fill="#ffffff" letter-spacing="2">ORTHOLOG</text>
  </g>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf8');
fs.writeFileSync(path.join(publicDir, 'icon-maskable.svg'), maskableSvgContent, 'utf8');

// HTML to render SVG to canvas and export PNG
const renderHtml = `<!DOCTYPE html>
<html>
<body>
  <canvas id="c"></canvas>
  <script>
    window.renderSvg = async (svgStr, size) => {
      const canvas = document.getElementById('c');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      return new Promise((resolve) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, size, size);
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL('image/png'));
        };
        img.src = url;
      });
    };
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(publicDir, 'render.html'), renderHtml, 'utf8');
console.log('SVG files created successfully');
