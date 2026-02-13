// Simple synth for UI sounds
const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
const ctx = new AudioContextClass();

const playTone = (freq: number, type: OscillatorType, duration: number, vol: number = 0.1) => {
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
};

export const playSound = {
    click: () => playTone(800, 'sine', 0.1, 0.05),
    clear: () => playTone(400, 'sine', 0.2, 0.05),
    success: () => {
        // Simple major chord arpeggio
        setTimeout(() => playTone(523.25, 'sine', 0.3, 0.1), 0);   // C5
        setTimeout(() => playTone(659.25, 'sine', 0.3, 0.1), 100); // E5
        setTimeout(() => playTone(783.99, 'sine', 0.6, 0.1), 200); // G5
    },
    failure: () => {
        setTimeout(() => playTone(300, 'sawtooth', 0.2, 0.05), 0);
        setTimeout(() => playTone(200, 'sawtooth', 0.4, 0.05), 150);
    }
};
