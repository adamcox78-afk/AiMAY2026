---
tags: [integrations, setup, api]
date: 2026-06-12
---

# Integration Setup Guide

## OpenAI (Core Brain)
- Model: GPT-4o via Chat Completions with Tools
- No extra subscription needed for built-in capabilities

## ElevenLabs (Voice)
1. Create account at elevenlabs.io
2. Get API key from Profile settings
3. Choose a British voice (suggested: "Harry" or "George")
4. Copy Voice ID to .env

## Gmail
1. Go to Google Cloud Console
2. Enable Gmail API
3. Create OAuth2 credentials
4. Download as `credentials.json`
5. Run Alma once to authorize

## Buffer
1. Go to buffer.com/developers
2. Create an app
3. Get Access Token
4. Add to .env

## RevenueCat
1. Dashboard -> API Keys -> Secret keys
2. Copy secret API key to .env

## Meta (Facebook/Instagram Ads)
1. developers.facebook.com
2. Create App -> Marketing API
3. Get long-lived Access Token
4. Add Account ID (format: act_XXXXXXXXXX)
