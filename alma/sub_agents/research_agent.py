import os
import json
from openai import OpenAI

RESEARCH_AGENT_PROMPT = """You are Alma's Research Intelligence sub-agent.
You use web search and browser tools to research topics,
monitor competitors, gather market intelligence, and summarize findings.
Be thorough, cite sources, and present findings in concise British style."""


def run_research_agent(task: str) -> str:
    """Run the Research sub-agent with web search and browser tools."""
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    tools = [
        {
            "type": "function",
            "function": {
                "name": "extract_webpage_text",
                "description": "Extract text content from a webpage URL",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "url": {"type": "string"}
                    },
                    "required": ["url"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "take_screenshot",
                "description": "Take a screenshot of a webpage",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "url": {"type": "string"}
                    },
                    "required": ["url"]
                }
            }
        },
    ]

    from alma.tools.browser_tool import BrowserTool
    browser = BrowserTool()

    def dispatch(name, args):
        if name == "extract_webpage_text":
            return browser.extract_text(args.get("url", ""))
        elif name == "take_screenshot":
            return browser.take_screenshot(args.get("url", ""))
        return "Unknown tool"

    messages = [
        {"role": "system", "content": RESEARCH_AGENT_PROMPT},
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
            return msg.content or "Research complete."

    return "Research complete."
