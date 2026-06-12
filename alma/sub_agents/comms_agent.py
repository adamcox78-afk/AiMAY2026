import os
import json
from openai import OpenAI

COMMS_AGENT_PROMPT = """You are Alma's Communications sub-agent.
You manage Gmail, draft responses, prioritize messages, and
identify action items from email threads.
Be efficient, clear, and maintain a professional British tone."""


def run_comms_agent(task: str) -> str:
    """Run the Communications sub-agent with Gmail tools."""
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    tools = [
        {
            "type": "function",
            "function": {
                "name": "get_unread_emails",
                "description": "Get unread emails from Gmail",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "max_results": {"type": "integer", "default": 10}
                    },
                    "required": []
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "search_emails",
                "description": "Search Gmail for specific emails",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string"}
                    },
                    "required": ["query"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "send_email",
                "description": "Send an email via Gmail",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "to": {"type": "string"},
                        "subject": {"type": "string"},
                        "body": {"type": "string"}
                    },
                    "required": ["to", "subject", "body"]
                }
            }
        },
    ]

    from alma.tools.gmail_tool import GmailTool
    gmail = GmailTool()

    def dispatch(name, args):
        if name == "get_unread_emails":
            return json.dumps(gmail.get_unread_emails(args.get("max_results", 10)))
        elif name == "search_emails":
            return json.dumps(gmail.search_emails(args.get("query", "")))
        elif name == "send_email":
            return json.dumps(gmail.send_email(args.get("to", ""), args.get("subject", ""), args.get("body", "")))
        return "Unknown tool"

    messages = [
        {"role": "system", "content": COMMS_AGENT_PROMPT},
        {"role": "user", "content": task},
    ]

    for _ in range(4):
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            tools=tools,
            tool_choice="auto",
        )
        msg = response.choices[0].message
        if msg.tool_calls:
            messages.append(msg)
            for tc in msg.tool_calls:
                try:
                    args = json.loads(tc.function.arguments)
                except Exception:
                    args = {}
                result = dispatch(tc.function.name, args)
                messages.append({"role": "tool", "tool_call_id": tc.id, "content": result})
        else:
            return msg.content or "Communications task complete."

    return "Communications task complete."
