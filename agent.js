// CarryOrBuy AI agent (Google Gemini, "bring your own key")
// The visitor's key is kept only in their own browser (localStorage), never in this code.

const GEMINI_MODEL = "gemini-3.6-flash";   // change here if Google renames its models
const KEY_STORE = "carryorbuy_gemini_key";

// 1. The agent's instructions: your guardrails from the deck
function agentInstructions(country) {
  const c = COUNTRIES[country];
  const lines = ITEMS.map(function (item) {
    const r = decide(item, country);
    return "- " + item.name + " | " + item.category + " | " + item.weightKg + " kg | India ₹" + item.priceIndia +
      " | " + country + " " + c.symbol + (item.prices[country] ?? "n/a") + " | verdict: " + r.verdict +
      (item.note ? " | note: " + item.note : "");
  }).join("\n");

  return "You are CarryOrBuy, a relocation shopping assistant for people moving from India to " + country + ".\n" +
    "Help them decide what to CARRY from India, what to BUY THERE after landing, and what to SKIP.\n\n" +
    "Decision rule: carry an item only if (price abroad in ₹ − price in India) is greater than its carry cost " +
    "(weight × ₹" + SETTINGS.valuePerKg + " per kg, +₹" + SETTINGS.fragilePenalty + " if fragile, −₹" + SETTINGS.weekOneBonus +
    " if needed in week 1) plus a minimum saving of ₹" + SETTINGS.minSaving + ", AND it works there AND clears customs.\n" +
    "Exchange rate: 1 " + c.currency + " = ₹" + c.rate + ". Plug/voltage: " + c.plug + ". Country note: " + c.note + "\n\n" +
    "Item list with current verdicts:\n" + lines + "\n\n" +
    "Guardrails (always follow):\n" +
    "1. Never suggest, recommend or substitute any medicine. Only remind people to carry their own prescribed medicines in original packs with the prescription, and to check the destination's rules.\n" +
    "2. Never buy anything or ask for payment details. You only advise; the person decides and pays.\n" +
    "3. Always flag customs: milk and meat products are generally not allowed into the EU/UK; food must be sealed and declared (especially Australia and New Zealand).\n" +
    "4. Prices in the list are indicative estimates, not live prices. Say so when quoting them and suggest checking the live price.\n" +
    "5. For items not in the list, reason with the same rule and say your figures are rough estimates.\n" +
    "6. Be concise and practical: at most about 150 words, a few short bullet points, use ₹. Use simple formatting only (bold and bullet points), no tables.";
}

// 2. Turn the agent's formatting (**bold**, ### headings, * bullets) into tidy HTML
function formatAnswer(text) {
  const safe = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let html = "", inList = false;
  safe.split("\n").forEach(function (raw) {
    let line = raw.trim()
      .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
      .replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, "$1<i>$2</i>");
    const bullet = /^([*-]|\d+\.)\s+/.test(raw.trim());
    if (bullet) {
      if (!inList) { html += "<ul>"; inList = true; }
      html += "<li>" + line.replace(/^([*-]|\d+\.)\s+/, "") + "</li>";
      return;
    }
    if (inList) { html += "</ul>"; inList = false; }
    if (/^-{3,}$/.test(line)) html += "<hr>";
    else if (/^#{1,6}\s/.test(line)) html += "<h4>" + line.replace(/^#{1,6}\s/, "") + "</h4>";
    else if (line) html += "<p>" + line + "</p>";
  });
  if (inList) html += "</ul>";
  return html;
}

// 3. Show a message in the chat window
function addMessage(who, text) {
  const box = document.getElementById("chatLog");
  const div = document.createElement("div");
  div.className = "msg " + who;
  div.textContent = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
  return div;
}

// 4. Save / forget the key
function saveKey() {
  const key = document.getElementById("apiKey").value.trim();
  if (!key) return;
  try { localStorage.setItem(KEY_STORE, key); } catch (e) {}
  document.getElementById("apiKey").value = "";
  refreshKeyStatus();
}
function forgetKey() {
  try { localStorage.removeItem(KEY_STORE); } catch (e) {}
  refreshKeyStatus();
}
function getKey() {
  try { return localStorage.getItem(KEY_STORE) || ""; } catch (e) { return ""; }
}
function refreshKeyStatus() {
  const has = !!getKey();
  document.getElementById("keyStatus").textContent = has ? "✅ Key saved in this browser only." : "No key saved yet.";
  document.getElementById("keyRow").style.display = has ? "none" : "flex";
  document.getElementById("forgetBtn").style.display = has ? "inline-block" : "none";
}

// 5. Ask Gemini
const history = [];

async function askAgent() {
  const input = document.getElementById("chatInput");
  const question = input.value.trim();
  if (!question) return;
  const key = getKey();
  if (!key) { addMessage("bot", "Please add your free Gemini API key first (see the link above)."); return; }

  input.value = "";
  addMessage("user", question);
  history.push({ role: "user", parts: [{ text: question }] });
  const thinking = addMessage("bot", "Thinking…");

  const country = document.getElementById("country").value;
  try {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + GEMINI_MODEL + ":generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: agentInstructions(country) }] },
        contents: history
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error((data.error && data.error.message) || ("Error " + res.status));
    const parts = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [];
    const answer = parts.map(function (p) { return p.text || ""; }).join("").trim() || "Sorry, I couldn't answer that.";
    thinking.innerHTML = formatAnswer(answer);
    history.push({ role: "model", parts: [{ text: answer }] });
  } catch (err) {
    thinking.textContent = "⚠️ " + err.message;
    history.pop();
  }
}

// 6. Connect the buttons
document.getElementById("saveKeyBtn").addEventListener("click", saveKey);
document.getElementById("forgetBtn").addEventListener("click", forgetKey);
document.getElementById("askBtn").addEventListener("click", askAgent);
document.getElementById("chatInput").addEventListener("keydown", function (e) { if (e.key === "Enter") askAgent(); });
document.querySelectorAll(".chip").forEach(function (chip) {
  chip.addEventListener("click", function () { document.getElementById("chatInput").value = chip.textContent; askAgent(); });
});
refreshKeyStatus();
