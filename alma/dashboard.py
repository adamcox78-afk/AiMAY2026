import os
import time
import threading
import asyncio
from datetime import datetime
from typing import List, Dict, Optional, Callable
from collections import deque

import psutil
from rich.console import Console
from rich.layout import Layout
from rich.live import Live
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich import box
from rich.align import Align
from rich.columns import Columns
from rich.padding import Padding
from rich.style import Style

console = Console()

ARC_REACTOR = """\
       ╭─────────────────╮
    ╭──┤   ◈ A L M A ◈   ├──╮
    │  ╰─────────────────╯  │
  ╭─┤     ╭───────────╮     ├─╮
  │ │   ╭─┤  ╭─────╮  ├─╮   │ │
  │ │   │ │  │  ▲  │  │ │   │ │
  │ │   ╰─┤  ╰─────╯  ├─╯   │ │
  ╰─┤     ╰───────────╯     ├─╯
    │  ╭─────────────────╮  │
    ╰──┤  AK INDUSTRIES   ├──╯
       ╰─────────────────╯"""


def _bar(value: float, width: int = 10) -> str:
    """Create a Unicode block progress bar."""
    filled = int(round(value / 100 * width))
    filled = max(0, min(width, filled))
    return "█" * filled + "░" * (width - filled)


def _color_for_pct(pct: float) -> str:
    if pct >= 90:
        return "bright_red"
    elif pct >= 70:
        return "bright_yellow"
    return "bright_cyan"


class AlmaDashboard:
    """Iron Man HUD-style terminal dashboard for Alma."""

    VERSION = "1.0.0"

    def __init__(self):
        self.chat_history: deque = deque(maxlen=20)
        self.status_messages: deque = deque(maxlen=5)
        self.active_processes: List[Dict] = []
        self.revenue_data: Dict = {"revenue": "N/A", "mrr": "N/A", "churn": "N/A"}
        self.connection_status: Dict = {
            "gmail": "INIT",
            "buffer": "INIT",
            "revenuecat": "INIT",
            "meta": "INIT",
            "voice": "INIT",
        }
        self._lock = threading.Lock()
        self._input_callback: Optional[Callable] = None
        self._voice_active = False
        self._running = False
        self._live: Optional[Live] = None
        self._start_time = time.time()

    def set_input_callback(self, callback: Callable):
        self._input_callback = callback

    def add_chat(self, role: str, text: str):
        """Add a message to chat history."""
        with self._lock:
            self.chat_history.append({"role": role, "text": text, "time": datetime.now().strftime("%H:%M")})

    def add_status(self, msg: str):
        with self._lock:
            self.status_messages.append(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

    def set_connection(self, service: str, status: str):
        with self._lock:
            self.connection_status[service] = status

    def set_revenue(self, revenue: str = "N/A", mrr: str = "N/A", churn: str = "N/A"):
        with self._lock:
            self.revenue_data = {"revenue": revenue, "mrr": mrr, "churn": churn}

    def set_voice_active(self, active: bool):
        self._voice_active = active

    def _uptime_str(self) -> str:
        elapsed = int(time.time() - self._start_time)
        h = elapsed // 3600
        m = (elapsed % 3600) // 60
        s = elapsed % 60
        return f"{h:02d}:{m:02d}:{s:02d}"

    def _make_header(self) -> Panel:
        t = Text()
        t.append("  ◈ ", style="bold bright_cyan")
        t.append("ALMA OS ", style="bold bright_white")
        t.append(f"v{self.VERSION}", style="bold cyan")
        t.append("    ", style="")
        t.append("♥ ", style="bold bright_green")
        t.append("STATUS: ", style="bold cyan")
        t.append("ONLINE", style="bold bright_green")
        t.append("    ", style="")
        t.append("⏰ ", style="bold cyan")
        t.append(datetime.now().strftime("%H:%M:%S"), style="bold bright_cyan")
        t.append("  ◈", style="bold bright_cyan")
        return Panel(
            Align.center(t),
            box=box.HEAVY,
            border_style="bold bright_cyan",
            style="on black",
        )

    def _make_system_panel(self) -> Panel:
        cpu = psutil.cpu_percent(interval=None)
        mem = psutil.virtual_memory()
        disk = psutil.disk_usage("/")

        try:
            net = psutil.net_io_counters()
            net_up = f"{net.bytes_sent / 1_048_576:.1f} MB"
            net_dn = f"{net.bytes_recv / 1_048_576:.1f} MB"
        except Exception:
            net_up = "N/A"
            net_dn = "N/A"

        mem_pct = mem.percent
        disk_pct = disk.percent

        t = Text()
        t.append("◆ SYSTEM DIAGNOSTICS\n", style="bold bright_white")
        t.append("─" * 20 + "\n", style="cyan")

        t.append(" CPU  ", style="cyan")
        t.append(_bar(cpu, 8), style=_color_for_pct(cpu))
        t.append(f" {cpu:4.1f}%\n", style="bright_cyan")

        t.append(" MEM  ", style="cyan")
        t.append(_bar(mem_pct, 8), style=_color_for_pct(mem_pct))
        t.append(f" {mem.used / 1_073_741_824:.1f}G\n", style="bright_cyan")

        t.append(" DISK ", style="cyan")
        t.append(_bar(disk_pct, 8), style=_color_for_pct(disk_pct))
        t.append(f" {disk_pct:.0f}%\n", style="bright_cyan")

        t.append("─" * 20 + "\n", style="cyan")
        t.append("◆ NETWORK\n", style="bold bright_white")
        t.append(f" ↑ Sent: ", style="cyan")
        t.append(f"{net_up}\n", style="bright_cyan")
        t.append(f" ↓ Recv: ", style="cyan")
        t.append(f"{net_dn}\n", style="bright_cyan")

        t.append("─" * 20 + "\n", style="cyan")
        t.append("◆ ENERGY\n", style="bold bright_white")
        t.append(" ⚡ POWER: ", style="cyan")
        t.append("100% MAX CAP\n", style="bright_green")

        t.append("─" * 20 + "\n", style="cyan")
        t.append("◆ VITAL SIGNS\n", style="bold bright_white")
        t.append(" ♥ ONLINE  ", style="bright_green")
        t.append(f"UP: {self._uptime_str()}\n", style="bright_cyan")

        return Panel(
            t,
            title="[bold bright_cyan]◈ SYS DIAG ◈[/]",
            box=box.HEAVY,
            border_style="cyan",
            style="on black",
        )

    def _make_center_panel(self) -> Panel:
        t = Text()
        t.append(ARC_REACTOR, style="bold bright_cyan")
        return Panel(
            Align.center(t, vertical="middle"),
            title="[bold bright_white]◈ A K   I N D U S T R I E S ◈[/]",
            box=box.HEAVY,
            border_style="bold bright_cyan",
            style="on black",
        )

    def _make_data_panel(self) -> Panel:
        t = Text()
        t.append("◆ DATA ANALYSIS\n", style="bold bright_white")
        t.append("─" * 20 + "\n", style="cyan")
        t.append(" ▸ Revenue  ", style="cyan")
        t.append(f"{self.revenue_data['revenue']}\n", style="bright_cyan")
        t.append(" ▸ MRR      ", style="cyan")
        t.append(f"{self.revenue_data['mrr']}\n", style="bright_cyan")
        t.append(" ▸ Churn    ", style="cyan")
        t.append(f"{self.revenue_data['churn']}\n", style="bright_cyan")

        t.append("─" * 20 + "\n", style="cyan")
        t.append("◆ MEMORY BANK\n", style="bold bright_white")
        mem = psutil.virtual_memory()
        t.append(f" Total: {mem.total / 1_073_741_824:.1f} GB\n", style="bright_cyan")
        t.append(f" Used:  {mem.used / 1_073_741_824:.1f} GB\n", style="bright_cyan")

        t.append("─" * 20 + "\n", style="cyan")
        t.append("◆ ENVIRONMENT\n", style="bold bright_white")
        t.append(f" ⏰ {datetime.now().strftime('%H:%M:%S')}\n", style="bright_cyan")
        t.append(f" \U0001f4c5 {datetime.now().strftime('%d %b %Y')}\n", style="bright_cyan")

        t.append("─" * 20 + "\n", style="cyan")
        t.append("◆ ACTIVE PROCESSES\n", style="bold bright_white")
        t.append(" ▸ alma.py    ", style="cyan")
        t.append("ACTIVE\n", style="bright_green")

        conn_colors = {"CONN": "bright_green", "INIT": "bright_yellow", "ERR": "bright_red", "OK": "bright_green"}
        for svc, stat in self.connection_status.items():
            color = conn_colors.get(stat, "bright_yellow")
            t.append(f" ▸ {svc:<10} ", style="cyan")
            t.append(f"{stat}\n", style=color)

        return Panel(
            t,
            title="[bold bright_cyan]◈ DATA ◈[/]",
            box=box.HEAVY,
            border_style="cyan",
            style="on black",
        )

    def _make_chat_panel(self) -> Panel:
        t = Text()
        t.append("◆ ALMA INTERFACE\n", style="bold bright_white")
        t.append("─" * 50 + "\n", style="cyan")

        if self._voice_active:
            t.append(" ● VOICE ACTIVE - Listening...\n", style="bold bright_yellow")

        with self._lock:
            history = list(self.chat_history)

        # Show last 8 messages
        for msg in history[-8:]:
            role = msg["role"]
            text = msg["text"]
            ts = msg.get("time", "")
            if role == "alma":
                t.append(f" [{ts}] ", style="dim cyan")
                t.append("ALMA: ", style="bold bright_cyan")
                # Wrap long lines
                words = text.split()
                line = ""
                for word in words:
                    if len(line) + len(word) + 1 > 48:
                        t.append(f"{line}\n", style="bright_cyan")
                        line = "       " + word
                    else:
                        line = (line + " " + word).strip() if line else word
                if line:
                    t.append(f"{line}\n", style="bright_cyan")
            else:
                t.append(f" [{ts}] ", style="dim white")
                t.append("YOU:  ", style="bold bright_white")
                t.append(f"{text[:60]}\n", style="white")

        t.append("─" * 50 + "\n", style="cyan")

        with self._lock:
            status_msgs = list(self.status_messages)
        for sm in status_msgs[-3:]:
            t.append(f" {sm}\n", style="dim cyan")

        t.append("\n [ENTER] Send  [V] Voice  [Q] Quit", style="dim bright_cyan")

        return Panel(
            t,
            title="[bold bright_white]◈ ALMA CHAT / VOICE INTERFACE ◈[/]",
            box=box.HEAVY,
            border_style="bold bright_cyan",
            style="on black",
        )

    def _build_layout(self) -> Layout:
        layout = Layout()
        layout.split_column(
            Layout(name="header", size=3),
            Layout(name="main", ratio=3),
            Layout(name="chat", ratio=2),
        )
        layout["main"].split_row(
            Layout(name="left", ratio=1),
            Layout(name="center", ratio=2),
            Layout(name="right", ratio=1),
        )
        return layout

    def render(self) -> Layout:
        layout = self._build_layout()
        layout["header"].update(self._make_header())
        layout["left"].update(self._make_system_panel())
        layout["center"].update(self._make_center_panel())
        layout["right"].update(self._make_data_panel())
        layout["chat"].update(self._make_chat_panel())
        return layout

    def start_live(self):
        """Start the live dashboard. Call from a background thread."""
        self._running = True
        with Live(
            self.render(),
            console=console,
            refresh_per_second=1,
            screen=True,
        ) as live:
            self._live = live
            while self._running:
                live.update(self.render())
                time.sleep(1)

    def stop(self):
        self._running = False
