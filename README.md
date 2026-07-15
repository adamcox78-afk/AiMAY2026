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

- **Contacts** — import from anywhere: **take a photo** of a printed or
  handwritten list (built-in OCR extracts names + numbers, no cloud service),
  drop a CSV/TXT/vCard file, paste a list, or add people one at a time. Every
  import goes through an editable review step before saving. Organize contacts
  into groups and toggle opt-out status.
- **New Blast** — pick groups and/or individual contacts, write one message with
  `{{firstName}}` / `{{lastName}}` / `{{name}}` tokens, and **attach pictures,
  GIFs, or videos** (MMS). The live iPhone preview shows exactly what each
  person receives. Every recipient gets their own individual text — never a
  group thread.
- **Campaigns** — live per-recipient delivery status, pause/resume, progress.
- **Settings** — starts in **Simulation** mode (no real texts, no credentials
  needed). Switch to **Live**, enter your Twilio Account SID, auth token, and
  from-number, then hit **Test connection** to verify them against Twilio and
  **Send a test text to yourself**. Live MMS also needs a **Public base URL**
  so carriers can fetch your media. Credentials stay in the local `data/`
  folder, which is gitignored.

## Compliance

An opt-out notice ("Reply STOP to opt out.") is appended to every message by
default, and pointing your provider's inbound-SMS webhook at
`/api/webhooks/inbound` marks contacts who reply STOP as opted out
automatically. Only text people who have agreed to receive messages from you.
