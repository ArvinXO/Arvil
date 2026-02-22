// Audio feedback system — Web Audio API based, no external files needed

type SoundType = 'success' | 'fail' | 'tick' | 'beep' | 'countdown' | 'start' | 'complete' | 'click';

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioCtx;
}

function playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.15,
    rampDown: boolean = true,
) {
    try {
        const ctx = getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        gain.gain.setValueAtTime(volume, ctx.currentTime);

        if (rampDown) {
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        }

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
    } catch {
        // Audio not supported — fail silently
    }
}

export function playSound(sound: SoundType): void {
    if (typeof window === 'undefined') return;

    switch (sound) {
        case 'success':
            // Rising two-tone chime
            playTone(523, 0.15, 'sine', 0.12);
            setTimeout(() => playTone(784, 0.3, 'sine', 0.12), 100);
            break;

        case 'fail':
            // Low descending buzz
            playTone(300, 0.15, 'square', 0.08);
            setTimeout(() => playTone(200, 0.3, 'square', 0.08), 100);
            break;

        case 'tick':
            // Soft tick
            playTone(800, 0.05, 'sine', 0.06);
            break;

        case 'beep':
            // Alert beep
            playTone(880, 0.1, 'sine', 0.1);
            break;

        case 'countdown':
            // Urgent countdown beep — higher pitch
            playTone(1200, 0.08, 'sine', 0.15);
            break;

        case 'start':
            // Triple ascending beep
            playTone(440, 0.1, 'sine', 0.1);
            setTimeout(() => playTone(554, 0.1, 'sine', 0.1), 150);
            setTimeout(() => playTone(660, 0.2, 'sine', 0.12), 300);
            break;

        case 'complete':
            // Achievement fanfare — ascending chord
            playTone(523, 0.15, 'sine', 0.1);
            setTimeout(() => playTone(659, 0.15, 'sine', 0.1), 100);
            setTimeout(() => playTone(784, 0.15, 'sine', 0.1), 200);
            setTimeout(() => playTone(1047, 0.4, 'sine', 0.12), 300);
            break;

        case 'click':
            // Minimal click
            playTone(600, 0.03, 'sine', 0.05);
            break;
    }
}

// Haptic feedback for mobile
export function haptic(style: 'light' | 'medium' | 'heavy' = 'light'): void {
    if (typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
        switch (style) {
            case 'light': navigator.vibrate(10); break;
            case 'medium': navigator.vibrate(25); break;
            case 'heavy': navigator.vibrate([50, 30, 50]); break;
        }
    } catch {
        // Vibration not supported
    }
}
