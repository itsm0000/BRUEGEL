import { DrawingPoint } from "./geometry";

export const exportCanvasToImage = (
    originalCanvas: HTMLCanvasElement,
    userPath: DrawingPoint[]
): void => {
    // Create a temporary canvas
    const canvas = document.createElement('canvas');
    canvas.width = originalCanvas.width;
    canvas.height = originalCanvas.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // 1. Fill White Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw User Path
    if (userPath.length > 1) {
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        for (let i = 1; i < userPath.length; i++) {
            const p1 = userPath[i - 1];
            const p2 = userPath[i];

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);

            // Simple pressure simulation
            const width = Math.max(1, p2.pressure * 8);
            ctx.lineWidth = width;
            ctx.strokeStyle = '#000000'; // Black ink
            ctx.stroke();
        }
    }

    // 3. Branding / Watermark
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#94a3b8'; // Slate 400
    ctx.textAlign = 'right';
    ctx.fillText('GhostFlow Art', canvas.width - 20, canvas.height - 20);

    // 4. Trigger Download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `ghostflow-art-${Date.now()}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
