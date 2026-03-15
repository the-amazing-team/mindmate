import sys
import torch
from transformers import WhisperProcessor, WhisperForConditionalGeneration
import soundfile as sf

def transcribe_audio(audio_path, model_id="openai/whisper-tiny"):
    """
    Transcribes audio to text using the Whisper model.
    """
    try:
        # load model and processor
        processor = WhisperProcessor.from_pretrained(model_id)
        model = WhisperForConditionalGeneration.from_pretrained(model_id)
        model.config.forced_decoder_ids = None

        # load audio file
        audio_input, sampling_rate = sf.read(audio_path)
        
        # Whisper expects 16000Hz
        if sampling_rate != 16000:
            # You might need to resample here in a real production environment
            pass

        input_features = processor(audio_input, sampling_rate=sampling_rate, return_tensors="pt").input_features 

        # generate token ids
        predicted_ids = model.generate(input_features)
        
        # decode token ids to text
        transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
        
        print(f"Transcription: {transcription}")
        return transcription
    except Exception as e:
        print(f"Error in Whisper STT: {e}")
        return None

if __name__ == "__main__":
    if len(sys.argv) > 1:
        audio_file = sys.argv[1]
        transcribe_audio(audio_file)
    else:
        print("Please provide an audio file path.")
