# Text Radar

Bulk SMS campaigns, sent individually to every contact — with personalization,
delivery tracking, and automatic STOP/opt-out handling. Interface styled
Apple-meets-Chrome.

## Run it

```bash
npm install
npm run preview   # build the UI and start the server
```

Then open http://localhost:4870.

For development with hot reload: `npm run dev` (client on :5173, API on :4870).
Tests: `npm test`.

## How it works

- **Contacts** — add people one at a time or paste a CSV (`First, Last, Phone`),
  organize them into groups, and toggle opt-out status.
- **New Blast** — pick groups and/or individual contacts, write one message with
  `{{firstName}}` / `{{lastName}}` / `{{name}}` tokens, and watch the live
  iPhone preview show exactly what each person receives. Every recipient gets
  their own individual text — never a group thread.
- **Campaigns** — live per-recipient delivery status, pause/resume, progress.
- **Settings** — starts in **Simulation** mode (no real texts, no credentials
  needed). Switch to **Live** and enter your Twilio Account SID, auth token,
  and from-number to send real SMS. Credentials stay in the local `data/`
  folder, which is gitignored.

## Compliance

An opt-out notice ("Reply STOP to opt out.") is appended to every message by
default, and pointing your provider's inbound-SMS webhook at
`/api/webhooks/inbound` marks contacts who reply STOP as opted out
automatically. Only text people who have agreed to receive messages from you.
