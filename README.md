# ✈️ CarryOrBuy: what to carry from India, what to buy abroad, what to skip

**Live demo:** https://anjali-bhushan.github.io/carryorbuy/

People moving abroad for study or work over-pack things that are cheap at the destination, run out of baggage space for things that are expensive there, and sometimes carry items customs won't allow. **CarryOrBuy** gives a clear verdict for each item, **Carry · Buy there · Skip · Not allowed**, with the reason.

> ⚠️ **Prototype.** Prices are indicative estimates (Nov 2026), not live prices. Customs and medicine rules are general guidance: always check the destination's official customs site. The tool never buys anything and never suggests medicines.

## How it decides
For each item, CarryOrBuy compares:

- **Price gap** = price abroad (converted to ₹) − price in India
- **Carry cost** = weight × value of 1 kg of bag space (+ a fragile penalty, − a bonus if it's needed in week 1)

**Carry** if the price gap is bigger than the carry cost plus a minimum saving, the item works there (plug/voltage) and it is allowed through customs. Otherwise **Buy there**, or **Skip** if it's optional. Anything customs won't allow (e.g. milk products) is **Not allowed**.

## Features
| Feature | What it does |
|---|---|
| 🌍 12 destinations | Germany, UK, US, France, Spain, Italy, Ireland, Canada, Australia, New Zealand, UAE, Russia, each with currency, exchange rate, plug/voltage and local notes |
| 🧳 29 items, 11 categories | Kitchen, clothing, appliances, sealed spices, bedding, stationery, toiletries, basic makeup, packed food, milk products, medicines, eye care |
| ⚖️ Bag-weight meter | Shows the kg used by "Carry" items against the baggage allowance |
| 💰 Budget check | Estimated cost of buying the rest at the destination against the setup budget |
| 🔗 Live price links | One click to search the item on Amazon.in and the destination's store |
| ⬇️ Download | The full list as a spreadsheet (opens in Excel) with a "Packed?" column |
| 🤖 AI agent | Google Gemini, using the same items, prices and rule, with guardrails: never buys, never suggests medicines, always flags customs |
| 📊 Usage analytics | Each search is logged **anonymously** (destination, baggage, budget, results) to a Google Sheet through Google Apps Script |

## Product decisions
- **Curated prices instead of live Amazon data:** Amazon's product API needs an approved affiliate account with qualifying sales per country, so live prices are the production roadmap step. "Check live price" links bridge the gap.
- **Bring-your-own Gemini key:** the repo is public, so no API key is stored in the code. Each visitor's key stays in their own browser.
- **Anonymous logging only:** no names, emails or AI questions are stored.

## Tech
HTML, CSS and JavaScript (no frameworks) · GitHub Pages · Google Gemini API · Google Apps Script + Google Sheets.

| File | Purpose |
|---|---|
| `index.html` | Page layout and travel design |
| `style.css` | Styles |
| `data.js` | Items, prices for 12 countries, exchange rates, decision settings |
| `app.js` | Decision rule, results, bag meter, download, anonymous logging |
| `agent.js` | AI assistant (Gemini) with guardrails |
| `apps-script.gs` | Google Apps Script that writes each search into a Google Sheet |
| `items.csv` | The item list as a spreadsheet |

## Roadmap
- Live prices through official retailer APIs once eligible
- More destinations and items; user-added items
- Saved packing lists across devices

---
Built by **Anjali Bhushan** · IIM Kozhikode · first presented as a course project at IIM Kozhikode
