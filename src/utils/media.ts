/**
 * Media and video helper utilities for orthopedic PACS and imaging
 */

/**
 * Checks if an attachment is a video file based on flag, category, or mime type / dataUrl
 */
export function isAttachmentVideo(attachment: {
  isVideo?: boolean;
  category?: string;
  name?: string;
  dataUrl?: string;
}): boolean {
  if (attachment.isVideo) return true;
  if (
    attachment.category === 'CT Video / 3D Cine Recon' ||
    attachment.category === 'Fluoroscopy / C-arm Cine' ||
    attachment.category === 'Arthroscopy Video Clip'
  ) {
    return true;
  }
  const name = attachment.name?.toLowerCase() || '';
  if (
    name.endsWith('.mp4') ||
    name.endsWith('.webm') ||
    name.endsWith('.mov') ||
    name.endsWith('.avi') ||
    name.endsWith('.mkv')
  ) {
    return true;
  }
  const dataUrl = attachment.dataUrl || '';
  if (dataUrl.startsWith('data:video/')) {
    return true;
  }
  return false;
}

/**
 * Generates an animated CT Cine loop video using HTML5 Canvas & MediaRecorder
 * Displays axial slice transitions through a pelvic / acetabular CT reconstruction
 */
export async function createSampleCtVideoDataUrl(): Promise<string> {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve('');
        return;
      }

      // Check if MediaRecorder is supported
      if (typeof MediaRecorder === 'undefined' || !canvas.captureStream) {
        resolve('');
        return;
      }

      const stream = canvas.captureStream(20);
      let options: MediaRecorderOptions = { mimeType: 'video/webm' };
      if (!MediaRecorder.isTypeSupported('video/webm')) {
        options = {};
      }

      const recorder = new MediaRecorder(stream, options);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(blob);
      };

      recorder.start();

      let frame = 0;
      const totalFrames = 45; // ~2.25 seconds loop

      const render = () => {
        const slice = (frame / totalFrames);
        const radius = 90 + Math.sin(slice * Math.PI) * 30;

        // CT Scanner background
        ctx.fillStyle = '#05070a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Circular scan gantry vignette
        const grad = ctx.createRadialGradient(200, 200, 40, 200, 200, 190);
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(0.7, '#0f172a');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(200, 200, 185, 0, Math.PI * 2);
        ctx.fill();

        // Bone cross sections (femoral heads and acetabulum)
        ctx.fillStyle = '#f8fafc';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;

        // Left Femoral Head slice
        ctx.beginPath();
        const leftX = 130 + Math.sin(slice * Math.PI * 2) * 8;
        const leftY = 200 + (slice - 0.5) * 30;
        ctx.arc(leftX, leftY, radius * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Right Femoral Head slice
        ctx.beginPath();
        const rightX = 270 - Math.sin(slice * Math.PI * 2) * 8;
        const rightY = 200 + (slice - 0.5) * 30;
        ctx.arc(rightX, rightY, radius * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Pelvic ring / sacrum
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.arc(200, 230, radius * 0.75, Math.PI * 0.8, Math.PI * 2.2);
        ctx.stroke();

        ctx.shadowBlur = 0;

        // CT HUD Data
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('3D CT CINE RECONSTRUCTION', 20, 30);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.fillText(`SLICE ${Math.floor(slice * 128) + 1}/128 · 0.625mm`, 20, 48);
        ctx.fillText('WL: 400 / WW: 1800 (BONE KERNEL)', 20, 64);
        ctx.fillText('FOV: 360mm · MATRIX: 512x512', 20, 80);

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('R', 360, 205);
        ctx.fillText('L', 25, 205);

        frame++;
        if (frame < totalFrames) {
          requestAnimationFrame(render);
        } else {
          recorder.stop();
        }
      };

      requestAnimationFrame(render);
    } catch (e) {
      console.warn('Canvas video generation failed:', e);
      resolve('');
    }
  });
}
