import os
import sys
import soundfile as sf
import torch
from kokoro import KPipeline

def generate_tts(text, voice='af_heart', output_file='output.wav'):
    """
    Generates speech from text using the Kokoro TTS model.
    """
    try:
        pipeline = KPipeline(lang_code='a')
        generator = pipeline(text, voice=voice)
        
        # Collect all audio chunks
        full_audio = []
        for i, (gs, ps, audio) in enumerate(generator):
            print(f"Generating chunk {i}: {gs}")
            full_audio.append(audio)
        
        if full_audio:
            # Concatenate chunks if necessary or just write the first one if only one
            # For simplicity in this script, we'll write them to separate files or combine them
            import numpy as np
            combined_audio = np.concatenate(full_audio)
            sf.write(output_file, combined_audio, 24000)
            print(f"Success! Saved to {output_file}")
            return True
    except Exception as e:
        print(f"Error in Kokoro TTS: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        text_input = sys.argv[1]
        voice_style = sys.argv[2] if len(sys.argv) > 2 else 'af_heart'
        output_path = sys.argv[3] if len(sys.argv) > 3 else 'output.wav'
        generate_tts(text_input, voice_style, output_path)
    else:
        # Default example from user prompt
        example_text = '''
        [Kokoro](/kˈOkəɹO/) is an open-weight TTS model with 82 million parameters. 
        Despite its lightweight architecture, it delivers comparable quality to larger models.
        '''
        generate_tts(example_text)
