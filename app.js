// CarryOrBuy: the "brain" and the results screen

// 1. THE DECISION RULE (same as the sheet)
function decide(item, country) {
  const c = COUNTRIES[country];
  const localPrice = item.prices[country];
  const result = { verdict: "", priceThere: 0, gap: 0, carryCost: 0, localPrice: localPrice };

  // Rule 1: customs says no -> never carry
  if (!item.customs) { result.verdict = "Not allowed"; return result; }

  // Rule 2: won't work there (plug/voltage) -> buy there, or skip if optional
  if (!item.works) { result.verdict = item.need === "Optional" ? "Skip" : "Buy there"; return result; }

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
  return "India " + rupees(item.priceIndia) + " vs " + country + " " + c.symbol + r.localPrice +
    " (" + rupees(r.priceThere) + "). You'd save " + rupees(r.gap) +
    "; carrying it costs about " + rupees(r.carryCost) + " in bag space.";
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

  ITEMS.forEach(function (item) {
    const r = decide(item, country);
    counts[r.verdict] = (counts[r.verdict] || 0) + 1;
    if (r.verdict === "Carry") carryKg += item.weightKg;
    if (r.verdict === "Buy there") buyThereCost += item.prices[country] * c.rate;
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push({ item: item, r: r });
  });

  // Summary + bag meter + budget
  const bagPct = Math.min(100, Math.round(carryKg / baggage * 100));
  const overBag = carryKg > baggage;
  const overBudget = buyThereCost > budget;

  let html = "";
  html += '<div class="card">';
  html += '<h2>Your list for ' + country + '</h2>';
  html += '<p class="muted">' + c.plug + ' · ' + c.note + '</p>';
  html += '<div class="counts">' +
    '<span class="pill carry">' + counts["Carry"] + ' Carry</span>' +
    '<span class="pill buy">' + counts["Buy there"] + ' Buy there</span>' +
    '<span class="pill skip">' + counts["Skip"] + ' Skip</span>' +
    '<span class="pill no">' + counts["Not allowed"] + ' Not allowed</span></div>';
  html += '<p><strong>Bag space:</strong> ' + carryKg.toFixed(1) + ' kg of ' + baggage + ' kg' +
    (overBag ? ' <span class="warn">Over your allowance!</span>' : '') + '</p>';
  html += '<div class="meter"><div class="fill' + (overBag ? ' over' : '') + '" style="width:' + bagPct + '%"></div></div>';
  html += '<p><strong>Buying there will cost about:</strong> ' + rupees(buyThereCost) + ' of your ' + rupees(budget) + ' budget' +
    (overBudget ? ' <span class="warn">Over budget</span>' : '') + '</p>';
  html += '</div>';

  // One card per category
  Object.keys(groups).forEach(function (cat) {
    html += '<div class="card"><h3>' + cat + '</h3>';
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
    'CarryOrBuy never buys anything for you and never suggests medicines.</p>';

  document.getElementById("results").innerHTML = html;
  document.getElementById("results").scrollIntoView({ behavior: "smooth" });
}

// 4. CONNECT THE BUTTON
document.getElementById("checkBtn").addEventListener("click", showList);
