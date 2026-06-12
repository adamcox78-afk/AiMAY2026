import os
import json
import asyncio
from typing import Optional
from openai import OpenAI
from datetime import datetime

ALMA_SYSTEM_PROMPT = """You are Alma, a sophisticated British AI assistant running the AK Industries command center. You speak with refined British precision — intelligent, warm, and occasionally dry wit. You are the central intelligence hub, coordinating multiple specialized sub-agents: Marketing (Buffer & Meta), Revenue (RevenueCat), Communications (Gmail), and Research (web & browser). You always address the user as "sir" or by name. You begin your daily brief with "Good morning. Here is your briefing for today." You are calm under pressure, deeply analytical, and fiercely loyal."""

class AlmaAgent:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.conversation_history = []
        self.tools = self._build_tools()
        self._tool_handlers = {}
        self._setup_tool_handlers()

    def _build_tools(self):
        return [
            {
                "type": "function",
                "function": {
                    "name": "get_daily_brief",
                    "description": "Compile and deliver the daily briefing from all sub-agents",
                    "parameters": {"type": "object", "properties": {}, "required": []}
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "check_gmail_summary",
                    "description": "Get a summary of recent Gmail emails",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "max_emails": {"type": "integer", "default": 10}
                        },
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_buffer_analytics",
                    "description": "Get Buffer social media analytics",
                    "parameters": {"type": "object", "properties": {}, "required": []}
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_revenuecat_metrics",
                    "description": "Get RevenueCat revenue and subscription metrics",
                    "parameters": {"type": "object", "properties": {}, "required": []}
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_meta_campaign_status",
                    "description": "Get Meta/Facebook advertising campaign status",
                    "parameters": {"type": "object", "properties": {}, "required": []}
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "search_knowledge_base",
                    "description": "Search the local knowledge base for information",
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
                    "name": "save_to_knowledge_base",
                    "description": "Save information to the knowledge base",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string"},
                            "content": {"type": "string"},
                            "category": {"type": "string"}
                        },
                        "required": ["title", "content", "category"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "open_browser",
                    "description": "Open a URL in the browser",
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
                    "name": "run_marketing_agent",
                    "description": "Delegate a task to the Marketing sub-agent (Buffer + Meta)",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task": {"type": "string"}
                        },
                        "required": ["task"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "run_revenue_agent",
                    "description": "Delegate a task to the Revenue sub-agent (RevenueCat)",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task": {"type": "string"}
                        },
                        "required": ["task"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "run_comms_agent",
                    "description": "Delegate a task to the Communications sub-agent (Gmail)",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task": {"type": "string"}
                        },
                        "required": ["task"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "run_research_agent",
                    "description": "Delegate a task to the Research sub-agent (web + browser)",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task": {"type": "string"}
                        },
                        "required": ["task"]
                    }
                }
            },
        ]

    def _setup_tool_handlers(self):
        from alma.tools.gmail_tool import GmailTool
        from alma.tools.buffer_tool import BufferTool
        from alma.tools.revenuecat_tool import RevenueCatTool
        from alma.tools.meta_tool import MetaTool
        from alma.tools.browser_tool import BrowserTool
        from alma.sub_agents.marketing_agent import run_marketing_agent
        from alma.sub_agents.revenue_agent import run_revenue_agent
        from alma.sub_agents.comms_agent import run_comms_agent
        from alma.sub_agents.research_agent import run_research_agent

        self._gmail = GmailTool()
        self._buffer = BufferTool()
        self._revenuecat = RevenueCatTool()
        self._meta = MetaTool()
        self._browser = BrowserTool()

        self._tool_handlers = {
            "get_daily_brief": self._handle_daily_brief,
            "check_gmail_summary": self._handle_gmail_summary,
            "get_buffer_analytics": self._handle_buffer_analytics,
            "get_revenuecat_metrics": self._handle_revenuecat_metrics,
            "get_meta_campaign_status": self._handle_meta_campaign_status,
            "search_knowledge_base": self._handle_search_knowledge,
            "save_to_knowledge_base": self._handle_save_knowledge,
            "open_browser": self._handle_open_browser,
            "run_marketing_agent": lambda args: run_marketing_agent(args.get("task", "")),
            "run_revenue_agent": lambda args: run_revenue_agent(args.get("task", "")),
            "run_comms_agent": lambda args: run_comms_agent(args.get("task", "")),
            "run_research_agent": lambda args: run_research_agent(args.get("task", "")),
        }

    def _handle_daily_brief(self, args):
        from alma.daily_brief import compile_brief_data
        return compile_brief_data(self._gmail, self._buffer, self._revenuecat, self._meta)

    def _handle_gmail_summary(self, args):
        max_emails = args.get("max_emails", 10)
        emails = self._gmail.get_unread_emails(max_results=max_emails)
        return json.dumps(emails)

    def _handle_buffer_analytics(self, args):
        profiles = self._buffer.get_profiles()
        return json.dumps(profiles)

    def _handle_revenuecat_metrics(self, args):
        overview = self._revenuecat.get_overview()
        return json.dumps(overview)

    def _handle_meta_campaign_status(self, args):
        account_id = os.getenv("META_AD_ACCOUNT_ID", "")
        campaigns = self._meta.get_campaigns(account_id)
        return json.dumps(campaigns)

    def _handle_search_knowledge(self, args):
        query = args.get("query", "")
        knowledge_dir = os.path.join(os.path.dirname(__file__), "knowledge")
        results = []
        for root, dirs, files in os.walk(knowledge_dir):
            for fname in files:
                if fname.endswith(".md"):
                    fpath = os.path.join(root, fname)
                    try:
                        with open(fpath, "r") as f:
                            content = f.read()
                        if query.lower() in content.lower():
                            results.append({"file": fname, "excerpt": content[:500]})
                    except Exception:
                        pass
        return json.dumps(results) if results else f"No results found for: {query}"

    def _handle_save_knowledge(self, args):
        title = args.get("title", "note")
        content = args.get("content", "")
        category = args.get("category", "general")
        knowledge_dir = os.path.join(os.path.dirname(__file__), "knowledge", "faqs")
        os.makedirs(knowledge_dir, exist_ok=True)
        safe_title = "".join(c if c.isalnum() or c in " _-" else "_" for c in title)
        filename = f"{safe_title.replace(' ', '_').lower()}.md"
        fpath = os.path.join(knowledge_dir, filename)
        with open(fpath, "w") as f:
            f.write(f"---\ntags: [{category}]\ndate: {datetime.now().strftime('%Y-%m-%d')}\n---\n\n# {title}\n\n{content}\n")
        return f"Saved to knowledge base: {filename}"

    def _handle_open_browser(self, args):
        url = args.get("url", "")
        result = self._browser.open_url(url)
        return result

    def _dispatch_tool(self, tool_name: str, tool_args: dict) -> str:
        handler = self._tool_handlers.get(tool_name)
        if handler:
            try:
                result = handler(tool_args)
                return str(result) if result is not None else "Done."
            except Exception as e:
                return f"Tool error ({tool_name}): {str(e)}"
        return f"Unknown tool: {tool_name}"

    def chat(self, user_message: str, on_tool_call=None) -> str:
        """Send a message to Alma and get a response, handling tool calls."""
        self.conversation_history.append({"role": "user", "content": user_message})
        messages = [{"role": "system", "content": ALMA_SYSTEM_PROMPT}] + self.conversation_history

        max_iterations = 5
        for _ in range(max_iterations):
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                tools=self.tools,
                tool_choice="auto",
            )
            msg = response.choices[0].message

            if msg.tool_calls:
                messages.append(msg)
                for tc in msg.tool_calls:
                    tool_name = tc.function.name
                    try:
                        tool_args = json.loads(tc.function.arguments)
                    except Exception:
                        tool_args = {}
                    if on_tool_call:
                        on_tool_call(tool_name, tool_args)
                    result = self._dispatch_tool(tool_name, tool_args)
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tc.id,
                        "content": result
                    })
            else:
                assistant_reply = msg.content or ""
                self.conversation_history.append({"role": "assistant", "content": assistant_reply})
                # Keep only last 50 messages
                if len(self.conversation_history) > 50:
                    self.conversation_history = self.conversation_history[-50:]
                return assistant_reply

        return "I apologise, sir. I seem to have encountered a loop. Please try again."

    def get_history(self):
        return self.conversation_history[-20:]
