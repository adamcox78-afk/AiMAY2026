import os
import json
from openai import OpenAI

MARKETING_AGENT_PROMPT = """You are Alma's Marketing Intelligence sub-agent.
You specialize in social media strategy (Buffer), paid advertising (Meta),
content performance analysis, and growth optimization.
Report findings concisely to Alma in British style.
Be analytical, specific with numbers, and actionable in recommendations."""


def run_marketing_agent(task: str) -> str:
    """Run the Marketing sub-agent with Buffer + Meta tools."""
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    tools = [
        {
            "type": "function",
            "function": {
                "name": "get_buffer_profiles",
                "description": "Get Buffer social media profiles and their stats",
                "parameters": {"type": "object", "properties": {}, "required": []}
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_meta_campaigns",
                "description": "Get Meta ad campaigns and their status",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "account_id": {"type": "string", "description": "Ad account ID"}
                    },
                    "required": []
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_meta_insights",
                "description": "Get Meta ad campaign performance insights",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "campaign_id": {"type": "string"},
                        "date_range": {"type": "string", "enum": ["last_7d", "last_30d", "today"]}
                    },
                    "required": ["campaign_id"]
                }
            }
        },
    ]

    from alma.tools.buffer_tool import BufferTool
    from alma.tools.meta_tool import MetaTool
    buffer = BufferTool()
    meta = MetaTool()

    def dispatch(name, args):
        if name == "get_buffer_profiles":
            return json.dumps(buffer.get_profiles())
        elif name == "get_meta_campaigns":
            return json.dumps(meta.get_campaigns(args.get("account_id", "")))
        elif name == "get_meta_insights":
            return json.dumps(meta.get_ad_insights(args.get("campaign_id", ""), args.get("date_range", "last_7d")))
        return "Unknown tool"

    messages = [
        {"role": "system", "content": MARKETING_AGENT_PROMPT},
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
            return msg.content or "Marketing agent completed task."

    return "Marketing analysis complete."
