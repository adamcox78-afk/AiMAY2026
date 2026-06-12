import os
import json
import base64
from email.mime.text import MIMEText
from typing import List, Dict, Optional

try:
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    GMAIL_AVAILABLE = True
except ImportError:
    GMAIL_AVAILABLE = False

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.modify",
]


class GmailTool:
    def __init__(self):
        self.creds_path = os.getenv("GMAIL_CREDENTIALS_PATH", "credentials.json")
        self.token_path = os.getenv("GMAIL_TOKEN_PATH", "token.json")
        self.service = None
        self._connected = False

    def _get_service(self):
        if not GMAIL_AVAILABLE:
            raise RuntimeError("Google API libraries not installed.")
        if self.service:
            return self.service
        creds = None
        if os.path.exists(self.token_path):
            creds = Credentials.from_authorized_user_file(self.token_path, SCOPES)
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not os.path.exists(self.creds_path):
                    raise RuntimeError(f"Gmail credentials not found at {self.creds_path}")
                flow = InstalledAppFlow.from_client_secrets_file(self.creds_path, SCOPES)
                creds = flow.run_local_server(port=0)
            with open(self.token_path, "w") as token:
                token.write(creds.to_json())
        self.service = build("gmail", "v1", credentials=creds)
        self._connected = True
        return self.service

    def get_unread_emails(self, max_results: int = 10) -> List[Dict]:
        try:
            svc = self._get_service()
            results = svc.users().messages().list(
                userId="me", labelIds=["INBOX", "UNREAD"], maxResults=max_results
            ).execute()
            messages = results.get("messages", [])
            emails = []
            for msg in messages:
                msg_data = svc.users().messages().get(
                    userId="me", id=msg["id"], format="metadata",
                    metadataHeaders=["Subject", "From", "Date"]
                ).execute()
                headers = {h["name"]: h["value"] for h in msg_data.get("payload", {}).get("headers", [])}
                snippet = msg_data.get("snippet", "")
                emails.append({
                    "id": msg["id"],
                    "subject": headers.get("Subject", "No Subject"),
                    "from": headers.get("From", "Unknown"),
                    "date": headers.get("Date", ""),
                    "snippet": snippet[:200],
                })
            return emails
        except Exception as e:
            return [{"error": str(e)}]

    def send_email(self, to: str, subject: str, body: str) -> Dict:
        try:
            svc = self._get_service()
            message = MIMEText(body)
            message["to"] = to
            message["subject"] = subject
            raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
            sent = svc.users().messages().send(userId="me", body={"raw": raw}).execute()
            return {"status": "sent", "id": sent.get("id", "")}
        except Exception as e:
            return {"error": str(e)}

    def search_emails(self, query: str, max_results: int = 10) -> List[Dict]:
        try:
            svc = self._get_service()
            results = svc.users().messages().list(
                userId="me", q=query, maxResults=max_results
            ).execute()
            messages = results.get("messages", [])
            emails = []
            for msg in messages:
                msg_data = svc.users().messages().get(
                    userId="me", id=msg["id"], format="metadata",
                    metadataHeaders=["Subject", "From", "Date"]
                ).execute()
                headers = {h["name"]: h["value"] for h in msg_data.get("payload", {}).get("headers", [])}
                emails.append({
                    "id": msg["id"],
                    "subject": headers.get("Subject", "No Subject"),
                    "from": headers.get("From", "Unknown"),
                    "date": headers.get("Date", ""),
                    "snippet": msg_data.get("snippet", "")[:200],
                })
            return emails
        except Exception as e:
            return [{"error": str(e)}]

    def is_connected(self) -> bool:
        try:
            self._get_service()
            return True
        except Exception:
            return False
