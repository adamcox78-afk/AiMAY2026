import os
import io
import wave
import threading
import queue
from typing import Optional

try:
    import pyaudio
    PYAUDIO_AVAILABLE = True
except ImportError:
    PYAUDIO_AVAILABLE = False

try:
    from elevenlabs import ElevenLabs, play, VoiceSettings
    ELEVENLABS_AVAILABLE = True
except ImportError:
    ELEVENLABS_AVAILABLE = False

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False


class VoiceSystem:
    """ElevenLabs TTS + OpenAI Whisper STT voice system."""

    def __init__(self):
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY")) if OPENAI_AVAILABLE else None
        self.eleven_client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY")) if ELEVENLABS_AVAILABLE else None
        self.voice_id = os.getenv("ELEVENLABS_VOICE_ID", "AdG3by2dBRFUdIBkHpFv")
        self.enabled = os.getenv("ALMA_VOICE_ENABLED", "true").lower() == "true"
        self.listening = False
        self._speak_lock = threading.Lock()
        self._audio_queue: queue.Queue = queue.Queue()

    def speak(self, text: str):
        """Generate British speech via ElevenLabs and play it."""
        if not self.enabled:
            return
        if not ELEVENLABS_AVAILABLE or not self.eleven_client:
            print(f"[ALMA] {text}")
            return
        try:
            with self._speak_lock:
                audio = self.eleven_client.text_to_speech.convert(
                    voice_id=self.voice_id,
                    text=text,
                    model_id="eleven_turbo_v2_5",
                    voice_settings=VoiceSettings(
                        stability=0.75,
                        similarity_boost=0.85,
                        style=0.2,
                        use_speaker_boost=True,
                    ),
                )
                play(audio)
        except Exception as e:
            print(f"[Voice Error] {e}")

    def speak_async(self, text: str):
        """Speak in a background thread so dashboard doesn't block."""
        t = threading.Thread(target=self.speak, args=(text,), daemon=True)
        t.start()

    def listen(self, duration: int = 5) -> str:
        """Record audio from microphone and transcribe with Whisper."""
        if not PYAUDIO_AVAILABLE:
            raise RuntimeError("PyAudio not installed. Cannot listen.")
        if not self.openai_client:
            raise RuntimeError("OpenAI client not available.")

        CHUNK = 1024
        FORMAT = pyaudio.paInt16
        CHANNELS = 1
        RATE = 16000

        p = pyaudio.PyAudio()
        stream = p.open(
            format=FORMAT,
            channels=CHANNELS,
            rate=RATE,
            input=True,
            frames_per_buffer=CHUNK,
        )

        frames = []
        for _ in range(0, int(RATE / CHUNK * duration)):
            data = stream.read(CHUNK, exception_on_overflow=False)
            frames.append(data)

        stream.stop_stream()
        stream.close()

        # Build WAV in memory
        wav_buffer = io.BytesIO()
        wf = wave.open(wav_buffer, "wb")
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(p.get_sample_size(FORMAT))
        wf.setframerate(RATE)
        wf.writeframes(b"".join(frames))
        wf.close()
        p.terminate()

        wav_buffer.seek(0)
        wav_buffer.name = "audio.wav"

        transcript = self.openai_client.audio.transcriptions.create(
            model="whisper-1",
            file=wav_buffer,
        )
        return transcript.text.strip()

    def listen_async(self, callback, duration: int = 5):
        """Listen in a background thread and call callback with transcript."""
        def _listen_thread():
            self.listening = True
            try:
                text = self.listen(duration=duration)
                if text:
                    callback(text)
            except Exception as e:
                callback(f"[Listen error: {e}]")
            finally:
                self.listening = False

        t = threading.Thread(target=_listen_thread, daemon=True)
        t.start()

    def is_available(self) -> bool:
        return PYAUDIO_AVAILABLE and ELEVENLABS_AVAILABLE and self.enabled

    def tts_available(self) -> bool:
        return ELEVENLABS_AVAILABLE and self.eleven_client is not None

    def stt_available(self) -> bool:
        return PYAUDIO_AVAILABLE and self.openai_client is not None
