import os
import json
from datetime import datetime


def compile_brief_data(gmail_tool, buffer_tool, revenuecat_tool, meta_tool) -> str:
    """Compile raw data from all sub-agents for the daily brief."""
    sections = []
    today = datetime.now().strftime("%A, %d %B %Y")
    sections.append(f"DATE: {today}")

    # Gmail
    try:
        emails = gmail_tool.get_unread_emails(max_results=5)
        if isinstance(emails, list) and emails:
            email_lines = []
            for e in emails[:5]:
                subj = e.get("subject", "No subject")
                sender = e.get("from", "Unknown")
                email_lines.append(f"  - From {sender}: {subj}")
            sections.append("EMAILS (unread):\n" + "\n".join(email_lines))
        else:
            sections.append("EMAILS: No unread emails or Gmail not configured.")
    except Exception as ex:
        sections.append(f"EMAILS: Unavailable ({ex})")

    # RevenueCat
    try:
        rc = revenuecat_tool.get_overview()
        if isinstance(rc, dict) and "metrics" in rc:
            m = rc["metrics"]
            mrr = m.get("mrr", "N/A")
            revenue = m.get("revenue", "N/A")
            sections.append(f"REVENUE:\n  MRR: {mrr}\n  Revenue: {revenue}")
        else:
            sections.append("REVENUE: Not configured or no data.")
    except Exception as ex:
        sections.append(f"REVENUE: Unavailable ({ex})")

    # Buffer
    try:
        profiles = buffer_tool.get_profiles()
        if isinstance(profiles, list) and profiles:
            profile_names = [p.get("service", "unknown") for p in profiles[:3]]
            sections.append(f"SOCIAL MEDIA: Connected profiles: {', '.join(profile_names)}")
        else:
            sections.append("SOCIAL MEDIA: Not configured or no profiles.")
    except Exception as ex:
        sections.append(f"SOCIAL MEDIA: Unavailable ({ex})")

    # Meta
    try:
        account_id = os.getenv("META_AD_ACCOUNT_ID", "")
        campaigns = meta_tool.get_campaigns(account_id)
        if isinstance(campaigns, list) and campaigns:
            active = [c for c in campaigns if c.get("status") == "ACTIVE"]
            sections.append(f"META ADS: {len(campaigns)} campaigns, {len(active)} active.")
        else:
            sections.append("META ADS: Not configured or no campaigns.")
    except Exception as ex:
        sections.append(f"META ADS: Unavailable ({ex})")

    return "\n\n".join(sections)


async def generate_daily_brief(agent) -> str:
    """Generate a comprehensive daily brief using Alma."""
    import asyncio

    prompt = (
        "Generate my complete daily brief. Use your tools to check Gmail for important emails, "
        "get RevenueCat revenue metrics, check Buffer social media performance, "
        "and check Meta campaign status. "
        "Format it as a spoken British briefing starting with "
        "'Good morning, sir. Here is your briefing for today.' "
        "Keep it concise but comprehensive."
    )
    # Run synchronous chat in executor to avoid blocking
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, agent.chat, prompt)
    return result


def save_daily_brief(content: str):
    """Save today's brief to the knowledge base."""
    briefs_dir = os.path.join(os.path.dirname(__file__), "knowledge", "daily_briefs")
    os.makedirs(briefs_dir, exist_ok=True)
    date_str = datetime.now().strftime("%Y-%m-%d")
    fpath = os.path.join(briefs_dir, f"{date_str}_brief.md")
    with open(fpath, "w") as f:
        f.write(f"---\ntags: [daily-brief]\ndate: {date_str}\n---\n\n# Daily Brief — {date_str}\n\n{content}\n")
    return fpath
