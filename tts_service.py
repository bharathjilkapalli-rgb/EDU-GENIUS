import os
import hashlib
from pathlib import Path
from app.core.config import settings

AUDIO_DIR = "./audio_cache"
os.makedirs(AUDIO_DIR, exist_ok=True)

async def text_to_speech(text: str, lang: str = "en") -> str:
    """Convert text to speech. Returns path to audio file."""
    # Cache by content hash
    text_hash = hashlib.md5(text.encode()).hexdigest()
    audio_path = f"{AUDIO_DIR}/{text_hash}.mp3"

    if os.path.exists(audio_path):
        return audio_path

    if settings.TTS_ENGINE == "gtts":
        return await _gtts(text, audio_path, lang)
    else:
        return await _web_fallback(text, audio_path)

async def _gtts(text: str, output_path: str, lang: str = "en") -> str:
    try:
        from gtts import gTTS
        # Limit text length for TTS
        text = text[:3000]
        tts = gTTS(text=text, lang=lang, slow=False)
        tts.save(output_path)
        return output_path
    except ImportError:
        raise ImportError("Install gTTS: pip install gtts")
    except Exception as e:
        raise Exception(f"TTS failed: {str(e)}")

async def _web_fallback(text: str, output_path: str) -> str:
    """Fallback: return text for browser Web Speech API."""
    # Write text to a .txt so frontend can use Web Speech API
    txt_path = output_path.replace(".mp3", ".txt")
    with open(txt_path, "w") as f:
        f.write(text[:3000])
    return txt_path
