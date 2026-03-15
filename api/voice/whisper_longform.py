import torch
from transformers import pipeline
from datasets import load_dataset

def long_form_transcription(audio_sample=None):
    """
    Demonstrates long-form transcription using Whisper.
    """
    device = "cuda:0" if torch.cuda.is_available() else "cpu"

    pipe = pipeline(
      "automatic-speech-recognition",
      model="openai/whisper-tiny",
      chunk_length_s=30,
      device=device,
    )

    if audio_sample is None:
        ds = load_dataset("hf-internal-testing/librispeech_asr_dummy", "clean", split="validation")
        audio_sample = ds[0]["audio"]

    # Generate prediction
    prediction = pipe(audio_sample.copy(), batch_size=8)["text"]
    print(f"Long-form prediction: {prediction}")

    # Return timestamps as well
    chunks = pipe(audio_sample.copy(), batch_size=8, return_timestamps=True)["chunks"]
    print(f"Chunks with timestamps: {chunks}")
    
    return prediction, chunks

if __name__ == "__main__":
    long_form_transcription()
