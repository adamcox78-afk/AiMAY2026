import os
import json
from openai import OpenAI

REVENUE_AGENT_PROMPT = """You are Alma's Revenue Intelligence sub-agent.
You specialize in subscription metrics (RevenueCat), MRR analysis,
churn prediction, and revenue optimization strategies.
Provide concise, data-driven insights in British style."""


def run_revenue_agent(task: str) -> str:
    """Run the Revenue sub-agent with RevenueCat tools."""
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    tools = [
        {
            "type": "function",
            "function": {
                "name": "get_revenue_overview",
                "description": "Get RevenueCat revenue overview and key metrics",
                "parameters": {"type": "object", "properties": {}, "required": []}
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_subscriber_info",
                "description": "Get details for a specific subscriber",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string"}
                    },
                    "required": ["user_id"]
                }
            }
        },
    ]

    from alma.tools.revenuecat_tool import RevenueCatTool
    rc = RevenueCatTool()

    def dispatch(name, args):
        if name == "get_revenue_overview":
            return json.dumps(rc.get_overview())
        elif name == "get_subscriber_info":
            return json.dumps(rc.get_subscriber(args.get("user_id", "")))
        return "Unknown tool"

    messages = [
        {"role": "system", "content": REVENUE_AGENT_PROMPT},
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
            return msg.content or "Revenue analysis complete."

    return "Revenue analysis complete."
