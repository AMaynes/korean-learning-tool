"""Render every spoken prompt with the same Korean Supertonic-3 F1 neural voice."""
import json
from pathlib import Path
import sys

import numpy as np
import sherpa_onnx
import soundfile as sf

model_dir = Path(sys.argv[1])
model = sherpa_onnx.OfflineTtsSupertonicModelConfig(**{
    name: str(model_dir / filename) for name, filename in {
        "duration_predictor": "duration_predictor.int8.onnx", "text_encoder": "text_encoder.int8.onnx",
        "vector_estimator": "vector_estimator.int8.onnx", "vocoder": "vocoder.int8.onnx",
        "tts_json": "tts.json", "unicode_indexer": "unicode_indexer.bin", "voice_style": "voice.bin",
    }.items()
})
tts = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(
    model=sherpa_onnx.OfflineTtsModelConfig(supertonic=model, num_threads=2)
))
config = sherpa_onnx.GenerationConfig()
config.sid = 0  # The model packs its voice styles alphabetically, starting with F1.
config.num_steps = 8
config.extra = {"lang": "ko"}
destination = Path("public/assets")
destination.mkdir(parents=True, exist_ok=True)
prompts = json.loads(Path(sys.argv[2]).read_text())
for index, text in enumerate(prompts):
    key = "-".join(format(ord(char), "x") for char in text)
    audio = tts.generate(text, config)
    samples = np.asarray(audio.samples)
    if not samples.size or not np.isfinite(samples).all() or np.max(np.abs(samples)) < 0.001:
        raise ValueError(f"Invalid audio for {text}")
    sf.write(destination / f"ko-f1-{key}.mp3", samples, audio.sample_rate)
    if index % 100 == 0:
        print(f"Rendered {index + 1} / {len(prompts)}", flush=True)
