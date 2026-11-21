// CarryOrBuy: the "brain" and the results screen

// 0. WHERE THE ITEM LIST COMES FROM
// Paste your Google Sheet "Publish to web" CSV link between the quotes.
// Leave it empty ("") to use the list in data.js instead.
const SHEET_CSV_URL = "";

// Paste your Google Apps Script "Web app" link between the quotes to save
// every search (anonymously) into your Google Sheet. Leave "" to save nothing.
const LOG_URL = " https://script.google.com/macros/s/AKfycbzsq...JBCgjsxA/exec ";

// 1. THE DECISION RULE (same as the sheet)
function decide(item, country) {
  const c = COUNTRIES[country];
  const localPrice = item.prices[country];
  const result = { verdict: "", priceThere: 0, gap: 0, carryCost: 0, localPrice: localPrice };

  // Rule 1: customs says no -> never carry
  if (!item.customs) { result.verdict = "Not allowed"; return result; }

  // Rule 2: won't work there (plug/voltage) -> buy there, or skip if optional
  if (!item.works) { result.verdict = item.need === "Optional" ? "Skip" : "Buy there"; return result; }

  // No price for this country yet
  if (localPrice === undefined || isNaN(localPrice)) { result.verdict = "Buy there"; result.noPrice = true; return result; }

  // Rule 3: compare money
  result.priceThere = localPrice * c.rate;              // price abroad in rupees
  result.gap = result.priceThere - item.priceIndia;     // how much more it costs abroad
  result.carryCost = item.weightKg * SETTINGS.valuePerKg;
  if (item.fragile) result.carryCost += SETTINGS.fragilePenalty;
  if (item.weekOne) result.carryCost -= SETTINGS.weekOneBonus;

  if (result.gap > result.carryCost + SETTINGS.minSaving) {
    result.verdict = "Carry";
  } else {
    result.verdict = item.need === "Optional" ? "Skip" : "Buy there";
  }
  return result;
}

// 2. SMALL HELPERS
function rupees(n) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

function whyText(item, r, country) {
  const c = COUNTRIES[country];
  if (r.verdict === "Not allowed") return "Customs: not allowed into most countries. Don't pack it.";
  if (!item.works) return "Won't work there as-is (" + c.plug + ").";
  if (r.noPrice) return "No price for " + country + " yet: check the live price.";
  return "India " + rupees(item.priceIndia) + " vs " + country + " " + c.symbol + r.localPrice +
    " (" + rupees(r.priceThere) + "). " +
    (r.gap > 0 ? "Carrying saves " + rupees(r.gap) : "It's no cheaper in India") +
    "; bag space for it is worth about " + rupees(Math.max(0, r.carryCost)) + ".";
}

// 3. BUILD THE RESULTS SCREEN
function showList() {
  const country = document.getElementById("country").value;
  const baggage = Number(document.getElementById("baggage").value);
  const budget = Number(document.getElementById("budget").value);
  const c = COUNTRIES[country];

  let carryKg = 0;
  let buyThereCost = 0;
  const counts = { "Carry": 0, "Buy there": 0, "Skip": 0, "Not allowed": 0 };
  const groups = {};
  lastList = [];

  ITEMS.forEach(function (item) {
    const r = decide(item, country);
    counts[r.verdict] = (counts[r.verdict] || 0) + 1;
    if (r.verdict === "Carry") carryKg += item.weightKg;
    if (r.verdict === "Buy there" && !r.noPrice) buyThereCost += item.prices[country] * c.rate;
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push({ item: item, r: r });
    lastList.push({ item: item, r: r });
  });

  // Summary + bag meter + budget
  const bagPct = Math.min(100, Math.round(carryKg / baggage * 100));
  const overBag = carryKg > baggage;
  const overBudget = buyThereCost > budget;

  const flags = { "Germany":"🇩🇪","UK":"🇬🇧","US":"🇺🇸","France":"🇫🇷","Spain":"🇪🇸","Italy":"🇮🇹","Ireland":"🇮🇪",
    "Canada":"🇨🇦","Australia":"🇦🇺","New Zealand":"🇳🇿","UAE":"🇦🇪","Russia":"🇷🇺" };

  let html = "";
  html += '<div class="card summary">';
  html += '<h2>' + (flags[country] || "") + ' Your list for ' + country + '</h2>';
  html += '<p class="muted">🔌 ' + c.plug + ' · ' + c.note + '</p>';
  html += '<div class="tiles">' +
    '<div class="tile"><strong>' + counts["Carry"] + '</strong><span>🧳 Carry</span></div>' +
    '<div class="tile"><strong>' + counts["Buy there"] + '</strong><span>🛒 Buy there</span></div>' +
    '<div class="tile"><strong>' + counts["Skip"] + '</strong><span>⏭️ Skip</span></div>' +
    '<div class="tile"><strong>' + counts["Not allowed"] + '</strong><span>⛔ Not allowed</span></div></div>';
  html += '<p><strong>Bag space:</strong> ' + carryKg.toFixed(1) + ' kg of ' + baggage + ' kg' +
    (overBag ? ' <span class="warn">Over your allowance!</span>' : '') + '</p>';
  html += '<div class="meter"><div class="fill' + (overBag ? ' over' : '') + '" style="width:' + bagPct + '%"></div></div>';
  html += '<p><strong>Buying there will cost about:</strong> ' + rupees(buyThereCost) + ' of your ' + rupees(budget) + ' budget' +
    (overBudget ? ' <span class="warn">Over budget</span>' : '') + '</p>';
  html += '<button class="secondary" onclick="downloadList()">⬇️ Download my list (opens in Excel)</button>';
  html += '</div>';

  // One card per category
  Object.keys(groups).forEach(function (cat) {
    const icons = { "Kitchen":"🍳","Clothing":"🧥","Appliances":"🔌","Spices (sealed)":"🌶️","Bedding":"🛏️","Stationery":"✏️",
      "Toiletries":"🧴","Makeup (basic)":"💄","Packed food":"🍪","Milk products":"🥛","Medicines":"💊","Eye care":"👓" };
    html += '<div class="card"><h3>' + (icons[cat] || "📦") + ' ' + cat + '</h3>';
    groups[cat].forEach(function (row) {
      const item = row.item, r = row.r;
      const cls = { "Carry": "carry", "Buy there": "buy", "Skip": "skip", "Not allowed": "no" }[r.verdict];
      const q = encodeURIComponent(item.name);
      html += '<div class="item ' + cls + '">';
      html += '<div class="item-top"><span class="name">' + item.name + '</span><span class="pill ' + cls + '">' + r.verdict + '</span></div>';
      html += '<p class="why">' + whyText(item, r, country) + '</p>';
      if (item.note) html += '<p class="note">' + item.note + '</p>';
      if (r.verdict !== "Not allowed") {
        html += '<p class="links">Check live price: ' +
          '<a href="https://www.amazon.in/s?k=' + q + '" target="_blank" rel="noopener">amazon.in</a> · ' +
          '<a href="' + c.searchUrl + q + '" target="_blank" rel="noopener">' + c.store + '</a></p>';
      }
      html += '</div>';
    });
    html += '</div>';
  });

  // Disclaimers
  html += '<p class="disclaimer">Indicative prices (Nov 2026), not live: check the live price before buying. ' +
    'Exchange rates: mid-market, Nov 2026. Customs and medicine rules are general guidance: check your destination\'s official customs site. ' +
    'CarryOrBuy never buys anything for you and never suggests medicines. ' +
    'We record anonymous usage (destination, baggage, budget and results) to improve the tool; no personal data is stored.</p>';

  document.getElementById("results").innerHTML = html;

  // Save an anonymous record of this search to the Google Sheet
  logEntry({
    country: country, baggage: baggage, budget: budget,
    carry: counts["Carry"], buy: counts["Buy there"], skip: counts["Skip"], notAllowed: counts["Not allowed"],
    kg: Number(carryKg.toFixed(1)), cost: Math.round(buyThereCost)
  });
  document.getElementById("results").scrollIntoView({ behavior: "smooth" });
}

// 4. DOWNLOAD THE LIST AS A SPREADSHEET (CSV opens in Excel / Google Sheets)
let lastList = [];
let lastCountry = "";

function downloadList() {
  const country = document.getElementById("country").value;
  const c = COUNTRIES[country];
  const cell = function (v) { v = String(v == null ? "" : v); return '"' + v.replace(/"/g, '""') + '"'; };
  const lines = [["Category", "Item", "Verdict", "Weight (kg)", "Price in India (Rs)", "Price in " + country + " (" + c.currency + ")", "Price there (Rs)", "Note", "Packed?"].map(cell).join(",")];
  lastList.forEach(function (row) {
    const i = row.item, r = row.r;
    lines.push([i.category, i.name, r.verdict, i.weightKg, i.priceIndia, i.prices[country],
      r.priceThere ? Math.round(r.priceThere) : "", i.note, ""].map(cell).join(","));
  });
  const blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "CarryOrBuy-" + country.replace(/ /g, "-") + ".csv";
  a.click();
}

// 5. LOAD ITEMS FROM A GOOGLE SHEET (if a link is set above)
function parseCSV(text) {
  const rows = []; let row = [], field = "", inQuotes = false;
  for (let k = 0; k < text.length; k++) {
    const ch = text[k];
    if (inQuotes) {
      if (ch === '"' && text[k + 1] === '"') { field += '"'; k++; }
      else if (ch === '"') inQuotes = false;
      else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[k + 1] === "\n") k++;
      row.push(field); field = "";
      if (row.some(function (x) { return x !== ""; })) rows.push(row);
      row = [];
    } else field += ch;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function loadFromSheet() {
  const status = document.getElementById("source");
  if (!SHEET_CSV_URL) { status.textContent = "📄 Item list: built-in (" + ITEMS.length + " items)"; return; }
  fetch(SHEET_CSV_URL)
    .then(function (res) { return res.text(); })
    .then(function (text) {
      const rows = parseCSV(text);
      const head = rows[0].map(function (h) { return h.trim(); });
      const col = function (name) { return head.indexOf(name); };
      const yes = function (v) { return String(v).trim().toUpperCase() === "TRUE"; };
      const fresh = rows.slice(1).filter(function (r) { return r[col("name")]; }).map(function (r) {
        const prices = {};
        Object.keys(COUNTRIES).forEach(function (cn) { if (col(cn) >= 0 && r[col(cn)] !== "") prices[cn] = Number(r[col(cn)]); });
        return {
          name: r[col("name")], category: r[col("category")], need: r[col("need")],
          weightKg: Number(r[col("weightKg")]), priceIndia: Number(r[col("priceIndia")]), prices: prices,
          works: yes(r[col("works")]), customs: yes(r[col("customs")]), fragile: yes(r[col("fragile")]),
          weekOne: yes(r[col("weekOne")]), note: r[col("note")] || ""
        };
      });
      if (fresh.length) { ITEMS.length = 0; fresh.forEach(function (x) { ITEMS.push(x); }); }
      status.textContent = "📊 Item list: live from Google Sheet (" + ITEMS.length + " items)";
    })
    .catch(function () { status.textContent = "📄 Couldn't reach the Google Sheet, using the built-in list (" + ITEMS.length + " items)"; });
}

// 6. SAVE ANONYMOUS USAGE TO GOOGLE SHEETS (no names, emails or personal data)
function logEntry(entry) {
  if (!LOG_URL) return;
  fetch(LOG_URL, {
    method: "POST",
    mode: "no-cors",                       // Google Apps Script accepts this without extra setup
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(entry)
  }).catch(function () { /* if saving fails, the site still works */ });
}

// 7. CONNECT THE BUTTON AND START
document.getElementById("checkBtn").addEventListener("click", showList);
loadFromSheet();
