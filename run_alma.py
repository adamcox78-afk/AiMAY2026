#!/usr/bin/env python3
"""
run_alma.py — Single entry point for the Alma AI Dashboard.

Usage:
    python run_alma.py

Controls (while running):
    Type a message and press ENTER to chat with Alma.
    Press V + ENTER to toggle voice input mode.
    Press Q + ENTER to quit.
"""

import os
import sys
import asyncio
import threading
import time
import signal
from datetime import datetime

# ── Ensure project root is on the path ──────────────────────────────────────
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# ── Load environment variables ───────────────────────────────────────────────
from dotenv import load_dotenv
load_dotenv(os.path.join(PROJECT_ROOT, ".env"))

# ── Validate critical env vars ───────────────────────────────────────────────
def check_env():
    key = os.getenv("OPENAI_API_KEY", "")
    if not key or key == "your_openai_api_key_here":
        print("\n[ERROR] OPENAI_API_KEY is not set.")
        print("  Copy .env.example to .env and fill in your API keys.\n")
        sys.exit(1)

check_env()

# ── Imports (after env is loaded) ────────────────────────────────────────────
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich import box

from alma.agent import AlmaAgent
from alma.dashboard import AlmaDashboard
from alma.voice import VoiceSystem

console = Console()

# ── Global state ─────────────────────────────────────────────────────────────
dashboard = AlmaDashboard()
agent = AlmaAgent()
voice = VoiceSystem()
_shutdown_event = threading.Event()
_voice_mode = False


def _probe_connections():
    """Check all integrations and update dashboard status."""
    services = {
        "gmail":      lambda: agent._gmail.is_connected(),
        "buffer":     lambda: agent._buffer.is_connected(),
        "revenuecat": lambda: agent._revenuecat.is_connected(),
        "meta":       lambda: agent._meta.is_connected(),
        "voice":      lambda: voice.tts_available(),
    }
    for name, check in services.items():
        try:
            ok = check()
            dashboard.set_connection(name, "CONN" if ok else "ERR")
        except Exception:
            dashboard.set_connection(name, "ERR")

    # Attempt to fetch live revenue data
    try:
        rc = agent._revenuecat.get_overview()
        if isinstance(rc, dict) and "metrics" in rc:
            m = rc["metrics"]
            dashboard.set_revenue(
                revenue=str(m.get("revenue", "N/A")),
                mrr=str(m.get("mrr", "N/A")),
                churn=str(m.get("churn_rate", "N/A")),
            )
    except Exception:
        pass


def _run_tool_status_callback(tool_name: str, tool_args: dict):
    """Called by AlmaAgent when it invokes a tool — update status bar."""
    dashboard.add_status(f"◈ Tool: {tool_name}")


def _handle_alma_response(response: str):
    """Display Alma's response in the dashboard and optionally speak it."""
    dashboard.add_chat("alma", response)
    dashboard.add_status("◈ Alma responded.")
    if os.getenv("ALMA_VOICE_ENABLED", "true").lower() == "true":
        voice.speak_async(response)


def _process_input(user_text: str):
    """Send user input to Alma and handle the response."""
    user_text = user_text.strip()
    if not user_text:
        return
    dashboard.add_chat("user", user_text)
    dashboard.add_status("◈ Thinking...")
    try:
        response = agent.chat(user_text, on_tool_call=_run_tool_status_callback)
        _handle_alma_response(response)
    except Exception as e:
        err = f"I'm terribly sorry, sir. An error occurred: {e}"
        dashboard.add_chat("alma", err)
        dashboard.add_status(f"[ERROR] {e}")


def _run_daily_brief():
    """Run the daily brief in a background thread."""
    dashboard.add_status("◈ Generating daily brief...")
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        from alma.daily_brief import generate_daily_brief, save_daily_brief
        brief = loop.run_until_complete(generate_daily_brief(agent))
        loop.close()
        dashboard.add_chat("alma", brief)
        save_daily_brief(brief)
        dashboard.add_status("◈ Daily brief complete.")
        if os.getenv("ALMA_VOICE_ENABLED", "true").lower() == "true":
            voice.speak_async(brief[:500])  # Speak first 500 chars
    except Exception as e:
        dashboard.add_chat("alma", f"Daily brief error: {e}")
        dashboard.add_status(f"[ERROR] Brief failed: {e}")


def _input_loop():
    """Read user input from stdin and dispatch to Alma."""
    global _voice_mode

    # Welcome message from Alma
    welcome = (
        "Good day, sir. I am Alma, your AI command centre. "
        "All systems are initialising. Type a message below, "
        "press V to activate voice mode, or Q to shut down."
    )
    dashboard.add_chat("alma", welcome)
    if os.getenv("ALMA_VOICE_ENABLED", "true").lower() == "true":
        voice.speak_async(welcome)

    # Run connection probe in background
    probe_thread = threading.Thread(target=_probe_connections, daemon=True)
    probe_thread.start()

    # Daily brief
    if os.getenv("ALMA_DAILY_BRIEF_ENABLED", "true").lower() == "true":
        brief_thread = threading.Thread(target=_run_daily_brief, daemon=True)
        brief_thread.start()

    while not _shutdown_event.is_set():
        try:
            # Non-blocking read with prompt hidden (dashboard covers terminal)
            line = input()
        except (EOFError, KeyboardInterrupt):
            _shutdown_event.set()
            break

        stripped = line.strip().lower()

        if stripped == "q" or stripped == "quit" or stripped == "exit":
            dashboard.add_chat("alma", "Shutting down. Goodbye, sir.")
            _shutdown_event.set()
            break

        elif stripped == "v":
            _voice_mode = not _voice_mode
            if _voice_mode:
                dashboard.add_status("◈ Voice mode ON — listening for 5s after each V press.")
                dashboard.set_voice_active(True)
                # Immediate listen
                voice.listen_async(_on_voice_input, duration=5)
            else:
                dashboard.add_status("◈ Voice mode OFF.")
                dashboard.set_voice_active(False)

        elif stripped == "v" and _voice_mode:
            dashboard.add_status("◈ Listening...")
            voice.listen_async(_on_voice_input, duration=5)

        elif line.strip():
            t = threading.Thread(target=_process_input, args=(line,), daemon=True)
            t.start()


def _on_voice_input(text: str):
    """Callback when Whisper transcription is ready."""
    dashboard.set_voice_active(False)
    if text.startswith("[Listen error"):
        dashboard.add_status(text)
        return
    dashboard.add_status(f"◈ Voice: {text[:40]}")
    _process_input(text)


def _signal_handler(sig, frame):
    _shutdown_event.set()


def main():
    signal.signal(signal.SIGINT, _signal_handler)
    signal.signal(signal.SIGTERM, _signal_handler)

    # Start dashboard in a background thread
    dash_thread = threading.Thread(target=dashboard.start_live, daemon=True)
    dash_thread.start()

    # Small delay so dashboard renders before input loop starts
    time.sleep(0.5)

    # Input loop runs on main thread
    try:
        _input_loop()
    except Exception as e:
        dashboard.add_status(f"[FATAL] {e}")
        _shutdown_event.set()

    # Graceful shutdown
    dashboard.stop()
    time.sleep(0.3)

    console.print(
        Panel(
            "[bold bright_cyan]Alma has been shut down. Goodbye, sir.[/]",
            box=box.HEAVY,
            border_style="cyan",
        )
    )


if __name__ == "__main__":
    main()
