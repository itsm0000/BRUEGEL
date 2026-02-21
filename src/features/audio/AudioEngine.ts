/**
 * AudioEngine — Singleton managing all game audio via Web Audio API.
 *
 * Design decisions:
 * - Multi-oscillator layering with detuning for rich timbres
 * - Proper ADSR envelopes (Attack-Decay-Sustain-Release) 
 * - Continuous brush oscillator with real-time pitch modulation
 * - 3-layer ambient music with progressive fade-in by accuracy
 * - All gain scheduling uses exponentialRampToValueAtTime for smooth transitions
 */

class AudioEngineClass {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;

    // Brush sound state
    private brushOsc: OscillatorNode | null = null;
    private brushGain: GainNode | null = null;
    private brushLfo: OscillatorNode | null = null;
    private brushLfoGain: GainNode | null = null;

    // Ambient music layers
    private ambientLayers: { osc: OscillatorNode; gain: GainNode }[] = [];
    private ambientRunning = false;

    // Cooldown to prevent chime spam
    private lastChimeTime = 0;
    private readonly CHIME_COOLDOWN_MS = 400;

    private ensureContext(): AudioContext {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            this.ctx = new AudioCtx();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.3;
            this.masterGain.connect(this.ctx.destination);
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.ctx;
    }

    private getMaster(): GainNode {
        this.ensureContext();
        return this.masterGain!;
    }

    // ─── Rich tone with harmonics and envelope ───────────────────────
    private playRichTone(
        freq: number,
        type: OscillatorType,
        duration: number,
        vol: number = 0.08,
        detune: number = 0,
        attack: number = 0.01,
        release: number = 0.1
    ): void {
        const ctx = this.ensureContext();
        const master = this.getMaster();
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime(detune, now);

        // ADSR envelope
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(vol, now + attack);
        gain.gain.setValueAtTime(vol, now + duration - release);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(master);

        osc.start(now);
        osc.stop(now + duration + 0.05);
    }

    // ─── Layered chord (multiple detuned oscillators) ────────────────
    private playChord(
        freqs: number[],
        type: OscillatorType,
        duration: number,
        vol: number = 0.05
    ): void {
        freqs.forEach((f, i) => {
            this.playRichTone(f, type, duration, vol, (i - 1) * 8, 0.02, 0.15);
        });
    }

    // ═══════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════

    /** Start continuous brush sound that modulates with speed */
    startBrushSound(): void {
        const ctx = this.ensureContext();
        const master = this.getMaster();
        if (this.brushOsc) return; // Already running

        const now = ctx.currentTime;

        // Main oscillator — soft sine for pencil-on-paper feel
        this.brushOsc = ctx.createOscillator();
        this.brushOsc.type = 'sine';
        this.brushOsc.frequency.setValueAtTime(280, now);

        // Gain with fade-in
        this.brushGain = ctx.createGain();
        this.brushGain.gain.setValueAtTime(0.001, now);
        this.brushGain.gain.exponentialRampToValueAtTime(0.04, now + 0.1);

        // Subtle LFO vibrato for organic feel
        this.brushLfo = ctx.createOscillator();
        this.brushLfo.type = 'sine';
        this.brushLfo.frequency.setValueAtTime(6, now); // 6 Hz vibrato

        this.brushLfoGain = ctx.createGain();
        this.brushLfoGain.gain.setValueAtTime(15, now); // ±15 Hz modulation depth

        this.brushLfo.connect(this.brushLfoGain);
        this.brushLfoGain.connect(this.brushOsc.frequency);

        this.brushOsc.connect(this.brushGain);
        this.brushGain.connect(master);

        this.brushOsc.start(now);
        this.brushLfo.start(now);
    }

    /** Update brush pitch based on drawing speed (0 = still, 1 = very fast) */
    updateBrushPitch(speedNormalized: number): void {
        if (!this.brushOsc || !this.ctx) return;
        // Map speed 0–1 to frequency 200–600 Hz
        const freq = 200 + Math.min(speedNormalized, 1) * 400;
        this.brushOsc.frequency.exponentialRampToValueAtTime(
            freq,
            this.ctx.currentTime + 0.05
        );

        // Also modulate volume slightly — faster = slightly louder
        if (this.brushGain) {
            const vol = 0.02 + Math.min(speedNormalized, 1) * 0.04;
            this.brushGain.gain.exponentialRampToValueAtTime(
                vol,
                this.ctx.currentTime + 0.05
            );
        }
    }

    /** Stop brush sound with fade-out */
    stopBrushSound(): void {
        if (!this.brushOsc || !this.ctx) return;
        const now = this.ctx.currentTime;

        if (this.brushGain) {
            this.brushGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        }

        const oscRef = this.brushOsc;
        const lfoRef = this.brushLfo;

        setTimeout(() => {
            try { oscRef?.stop(); } catch { /* already stopped */ }
            try { lfoRef?.stop(); } catch { /* already stopped */ }
        }, 200);

        this.brushOsc = null;
        this.brushGain = null;
        this.brushLfo = null;
        this.brushLfoGain = null;
    }

    /** Magical triangle chime on perfect alignment (with cooldown) */
    playPerfectChime(): void {
        const now = performance.now();
        if (now - this.lastChimeTime < this.CHIME_COOLDOWN_MS) return;
        this.lastChimeTime = now;

        // Layered chime: fundamental + fifth + octave for rich bell sound
        this.playRichTone(1200, 'triangle', 0.3, 0.06, 0, 0.005, 0.2);
        this.playRichTone(1800, 'triangle', 0.25, 0.03, 5, 0.005, 0.2);
        this.playRichTone(2400, 'sine', 0.2, 0.02, -3, 0.005, 0.15);
    }

    /** Victory fanfare — rising arpeggio C5→E5→G5→C6 with sustain */
    playVictoryFanfare(): void {
        // Main arpeggio
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 E5 G5 C6
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playRichTone(freq, 'sine', 0.4, 0.08, 0, 0.01, 0.15);
                this.playRichTone(freq, 'triangle', 0.35, 0.04, 7, 0.01, 0.15); // Shimmer layer
            }, i * 120);
        });

        // Final chord swell
        setTimeout(() => {
            this.playChord([523.25, 659.25, 783.99, 1046.50], 'sine', 1.0, 0.04);
        }, 500);
    }

    /** Failure sound — descending minor tone */
    playFailure(): void {
        this.playRichTone(350, 'sine', 0.2, 0.05, 0, 0.01, 0.1);
        setTimeout(() => {
            this.playRichTone(280, 'sine', 0.3, 0.05, -5, 0.01, 0.15);
        }, 150);
    }

    /** Streak break — sad descending "wah" */
    playStreakBreak(): void {
        const ctx = this.ensureContext();
        const master = this.getMaster();
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.4);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(gain);
        gain.connect(master);

        osc.start(now);
        osc.stop(now + 0.55);
    }

    /** Jackpot celebration — extra dramatic fanfare */
    playJackpot(): void {
        // Dramatic drum-roll build with rapid ascending tones
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.playRichTone(300 + i * 80, 'square', 0.08, 0.03, i * 3, 0.005, 0.04);
            }, i * 50);
        }
        // Explosive chord
        setTimeout(() => {
            this.playChord([523.25, 659.25, 783.99, 1046.50], 'sine', 1.2, 0.06);
            this.playChord([523.25, 659.25, 783.99, 1046.50], 'triangle', 1.0, 0.03);
        }, 450);
    }

    /** UI click sound */
    playClick(): void {
        this.playRichTone(800, 'sine', 0.08, 0.03, 0, 0.005, 0.04);
    }

    /** Canvas clear sound */
    playClear(): void {
        this.playRichTone(500, 'sine', 0.15, 0.04, 0, 0.01, 0.08);
        this.playRichTone(400, 'sine', 0.2, 0.03, -5, 0.05, 0.1);
    }

    /** Star earned ding */
    playStarDing(starIndex: number): void {
        const freq = 800 + starIndex * 200; // Higher pitch for each star
        this.playRichTone(freq, 'triangle', 0.2, 0.06, 0, 0.005, 0.12);
        this.playRichTone(freq * 1.5, 'sine', 0.15, 0.03, 3, 0.005, 0.1);
    }

    // ─── Ambient Music ───────────────────────────────────────────────

    /** Start layered ambient music (bass drone + mid pad + high shimmer) */
    startAmbientMusic(): void {
        if (this.ambientRunning) return;
        const ctx = this.ensureContext();
        const master = this.getMaster();
        const now = ctx.currentTime;

        // Layer definitions: [frequency, type, initialVolume]
        const layerDefs: [number, OscillatorType, number][] = [
            [65.41, 'sine', 0.02],      // C2 bass drone — always audible
            [130.81, 'triangle', 0.0],   // C3 mid pad — fades in at 50% accuracy
            [261.63, 'sine', 0.0],       // C4 high shimmer — fades in at 80% accuracy
        ];

        this.ambientLayers = layerDefs.map(([freq, type, vol]) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, now);
            // Subtle detuning for warmth
            osc.detune.setValueAtTime(Math.random() * 10 - 5, now);

            gain.gain.setValueAtTime(Math.max(vol, 0.001), now);

            osc.connect(gain);
            gain.connect(master);
            osc.start(now);

            return { osc, gain };
        });

        this.ambientRunning = true;
    }

    /** Update ambient layers based on current accuracy (0–100) */
    updateAmbientLayers(accuracy: number): void {
        if (!this.ambientRunning || !this.ctx) return;
        const now = this.ctx.currentTime;

        // Layer 0 (bass): always on at 0.02
        if (this.ambientLayers[0]) {
            this.ambientLayers[0].gain.gain.exponentialRampToValueAtTime(0.02, now + 0.5);
        }

        // Layer 1 (mid): fade in when accuracy > 50
        if (this.ambientLayers[1]) {
            const midVol = accuracy > 50 ? 0.015 * Math.min((accuracy - 50) / 30, 1) : 0.001;
            this.ambientLayers[1].gain.gain.exponentialRampToValueAtTime(
                Math.max(midVol, 0.001), now + 0.5
            );
        }

        // Layer 2 (high): fade in when accuracy > 80
        if (this.ambientLayers[2]) {
            const highVol = accuracy > 80 ? 0.01 * Math.min((accuracy - 80) / 15, 1) : 0.001;
            this.ambientLayers[2].gain.gain.exponentialRampToValueAtTime(
                Math.max(highVol, 0.001), now + 0.5
            );
        }
    }

    /** Stop ambient music with fade-out */
    stopAmbientMusic(): void {
        if (!this.ambientRunning || !this.ctx) return;
        const now = this.ctx.currentTime;

        this.ambientLayers.forEach(({ osc, gain }) => {
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            setTimeout(() => {
                try { osc.stop(); } catch { /* already stopped */ }
            }, 600);
        });

        this.ambientLayers = [];
        this.ambientRunning = false;
    }

    /** Clean up all audio resources */
    dispose(): void {
        this.stopBrushSound();
        this.stopAmbientMusic();
        if (this.ctx && this.ctx.state !== 'closed') {
            this.ctx.close();
        }
        this.ctx = null;
        this.masterGain = null;
    }
}

// Singleton export
export const AudioEngine = new AudioEngineClass();
