"""Build the static Korean fallback clips used when device speech is unavailable."""
from pathlib import Path
import subprocess
import wave

destination = Path(__file__).resolve().parents[1] / "public" / "assets"
destination.mkdir(parents=True, exist_ok=True)

# In isolation there is either no coda or one of seven audible final sounds.
for stem in range(19 * 21):
    for coda in (0, 1, 4, 7, 8, 16, 17, 21):
        code = 0xAC00 + stem * 28 + coda
        path = destination / f"hangul-{code:x}.wav"
        subprocess.run(["espeak-ng", "-v", "ko", "-s", "145", "-w", str(path), chr(code)], check=True)
        with wave.open(str(path)) as sound:
            if sound.getnframes() == 0:
                raise ValueError(f"Empty pronunciation for {chr(code)}")
