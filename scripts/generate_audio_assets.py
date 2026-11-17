"""Generate LEARN's original, offline-ready loop music with the Python standard library.

All tones, notes, arrangements, and samples are generated from this source code;
there are no third-party recordings, samples, or external audio dependencies.
"""
from __future__ import annotations

import math
import os
import struct
import wave

RATE = 22050
DURATION = 18.0
ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "audio")

# Track: tempo, chord progressions in MIDI, melodic notes in MIDI, brightness.
TRACKS = {
    "calm": (62, [(48, 55, 60, 64), (45, 52, 57, 60), (41, 48, 53, 57), (43, 50, 55, 59)], [72, 76, 79, 76, 74, 72, 67, 72], 0.78),
    "reading": (54, [(48, 55, 60, 64), (43, 50, 55, 59), (45, 52, 57, 60), (41, 48, 53, 57)], [76, 79, 84, 79, 76, 74, 72, 74], 0.55),
    "game": (96, [(60, 67, 72, 76), (55, 62, 67, 71), (57, 64, 69, 72), (53, 60, 65, 69)], [84, 79, 81, 76, 79, 76, 72, 76], 0.92),
    "celebration": (108, [(60, 64, 67, 72), (55, 59, 62, 67), (57, 60, 64, 69), (53, 57, 60, 65)], [84, 88, 91, 88, 86, 84, 79, 84], 1.0),
}


def hz(midi: int) -> float:
    return 440.0 * (2.0 ** ((midi - 69) / 12.0))


def envelope(t: float, start: float, duration: float, attack: float, release: float) -> float:
    local = t - start
    if local < 0 or local > duration:
        return 0.0
    return min(1.0, local / attack, (duration - local) / release) if local < attack or duration - local < release else 1.0


def render(name: str, config: tuple) -> None:
    tempo, chords, melody, brightness = config
    count = int(RATE * DURATION)
    samples = bytearray()
    beat = 60.0 / tempo
    chord_seconds = DURATION / len(chords)
    melody_step = beat * (2.0 if name in ("calm", "reading") else 1.0)
    melody_duration = melody_step * 1.6

    for i in range(count):
        t = i / RATE
        chord_idx = min(int(t / chord_seconds), len(chords) - 1)
        chord_start = chord_idx * chord_seconds
        chord_level = envelope(t, chord_start, chord_seconds + 0.15, 0.8, 1.0)
        sample = 0.0
        for note in chords[chord_idx]:
            f = hz(note)
            # Soft additive pad: fundamental with quiet, rounded upper partials.
            sample += (math.sin(2 * math.pi * f * t)
                       + 0.22 * math.sin(2 * math.pi * f * 2 * t)
                       + 0.07 * math.sin(2 * math.pi * f * 3 * t)) * chord_level * 0.035

        event = int(t / melody_step)
        note_start = event * melody_step
        note = melody[event % len(melody)]
        note_env = envelope(t, note_start, melody_duration, 0.035, min(0.45, melody_duration * 0.8))
        f = hz(note)
        pluck = math.sin(2 * math.pi * f * t) + 0.18 * math.sin(2 * math.pi * f * 2 * t)
        sample += pluck * note_env * (0.055 + brightness * 0.018)

        # Tiny warm bass pulse on the beat; no percussion or sudden transients.
        bass_note = chords[chord_idx][0] - 12
        bass_env = envelope(t, math.floor(t / beat) * beat, beat * 0.9, 0.025, beat * 0.65)
        sample += math.sin(2 * math.pi * hz(bass_note) * t) * bass_env * 0.025

        # Short equal-power edge fades make the loop join unobtrusively.
        edge = min(1.0, t / 0.35, (DURATION - t) / 0.35)
        sample *= max(0.0, edge) * 0.72
        value = max(-1.0, min(1.0, sample))
        samples.extend(struct.pack("<h", int(value * 32767)))

    path = os.path.join(ROOT, f"{name}.wav")
    os.makedirs(ROOT, exist_ok=True)
    with wave.open(path, "wb") as out:
        out.setnchannels(1)
        out.setsampwidth(2)
        out.setframerate(RATE)
        out.writeframes(samples)
    print(f"{path}: {os.path.getsize(path) / 1024:.0f} KiB")


if __name__ == "__main__":
    for track_name, track_config in TRACKS.items():
        render(track_name, track_config)
