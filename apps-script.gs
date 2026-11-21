// CarryOrBuy usage logger: paste this into Google Apps Script (Extensions > Apps Script)
// Each search on the website adds one row to the "Entries" tab of this Google Sheet.

function doPost(e) {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = book.getSheetByName("Entries") || book.insertSheet("Entries");

  // Add the header row the first time
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Date & time", "Destination", "Baggage (kg)", "Budget (₹)",
      "Carry", "Buy there", "Skip", "Not allowed", "Kg carried", "Buy-there cost (₹)"]);
  }

  const d = JSON.parse(e.postData.contents);
  const num = function (v) { const n = Number(v); return isFinite(n) ? n : ""; };

  sheet.appendRow([
    new Date(),
    String(d.country || "").slice(0, 40),   // limit length so nobody can fill the sheet with junk
    num(d.baggage), num(d.budget),
    num(d.carry), num(d.buy), num(d.skip), num(d.notAllowed),
    num(d.kg), num(d.cost)
  ]);

  return ContentService.createTextOutput("ok");
}
