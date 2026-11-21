// CarryOrBuy data file
// Copied from the CarryOrBuy - Decision Logic sheet.
// Prices are rough indicative estimates (Nov 2026), not live prices.

// 1. Your decision numbers (the "Your numbers" tab)
const SETTINGS = {
  valuePerKg: 500,        // value of 1 kg of bag space (₹)
  minSaving: 500,         // minimum saving worth carrying (₹)
  fragilePenalty: 300,    // extra cost if the item is fragile (₹)
  weekOneBonus: 500       // bonus if needed in week 1 (₹)
};

// 2. Countries: currency, ₹ per 1 unit, where to check prices, plug info
// Rates: XE mid-market 6 Nov 2026 (NZD 13 Nov; AED via USD peg; RUB approx.)
const COUNTRIES = {
  "Germany": { currency: "EUR", symbol: "€", rate: 104.7, store: "amazon.de", searchUrl: "https://www.amazon.de/s?k=", plug: "Type C/F, 230 V", note: "Most Indian 230 V appliances work with a plug adapter." },
  "UK": { currency: "GBP", symbol: "£", rate: 125.5, store: "amazon.co.uk", searchUrl: "https://www.amazon.co.uk/s?k=", plug: "Type G, 230 V", note: "Needs a UK 3-pin adapter." },
  "US": { currency: "USD", symbol: "$", rate: 94, store: "amazon.com", searchUrl: "https://www.amazon.com/s?k=", plug: "Type A/B, 120 V", note: "Indian 230 V appliances need a voltage converter: usually Buy there." },
  "France": { currency: "EUR", symbol: "€", rate: 104.7, store: "amazon.fr", searchUrl: "https://www.amazon.fr/s?k=", plug: "Type C/E, 230 V", note: "Plug adapter needed for Indian 3-pin plugs." },
  "Spain": { currency: "EUR", symbol: "€", rate: 104.7, store: "amazon.es", searchUrl: "https://www.amazon.es/s?k=", plug: "Type C/F, 230 V", note: "Plug adapter needed for Indian 3-pin plugs." },
  "Italy": { currency: "EUR", symbol: "€", rate: 104.7, store: "amazon.it", searchUrl: "https://www.amazon.it/s?k=", plug: "Type C/F/L, 230 V", note: "Plug adapter needed for Indian 3-pin plugs." },
  "Ireland": { currency: "EUR", symbol: "€", rate: 104.7, store: "amazon.ie", searchUrl: "https://www.amazon.ie/s?k=", plug: "Type G, 230 V", note: "Same 3-pin plug as the UK." },
  "Canada": { currency: "CAD", symbol: "C$", rate: 66.6, store: "amazon.ca", searchUrl: "https://www.amazon.ca/s?k=", plug: "Type A/B, 120 V", note: "Like the US: 120 V, so most Indian appliances need a converter. Proper winter wear is essential." },
  "Australia": { currency: "AUD", symbol: "A$", rate: 64.5, store: "amazon.com.au", searchUrl: "https://www.amazon.com.au/s?k=", plug: "Type I, 230 V", note: "Strict customs on food, spices and seeds: declare them." },
  "New Zealand": { currency: "NZD", symbol: "NZ$", rate: 52.2, store: "Trade Me", searchUrl: "https://www.trademe.co.nz/a/search?search_string=", plug: "Type I, 230 V", note: "Very strict biosecurity: declare all food, spices and wooden items." },
  "UAE": { currency: "AED", symbol: "AED ", rate: 25.6, store: "amazon.ae", searchUrl: "https://www.amazon.ae/s?k=", plug: "Type G (also C/D), 230 V", note: "Some medicines are controlled: carry the prescription and check the approved list." },
  "Russia": { currency: "RUB", symbol: "₽", rate: 1, store: "ozon.ru", searchUrl: "https://www.ozon.ru/search/?text=", plug: "Type C/F, 230 V", note: "No Amazon. Check whether Indian cards work there; plan cash or a local card." }
};

// 3. Items: weight (kg), price in India (₹), price in each country (local currency)
// works = works abroad, customs = allowed through customs, fragile, weekOne = needed in week 1
const ITEMS = [
  {
    name: "Pressure cooker (3 L)", category: "Kitchen", need: "Must", weightKg: 2, priceIndia: 2000,
    prices: { "Germany": 45, "UK": 40, "US": 50, "France": 45, "Spain": 43, "Italy": 45, "Ireland": 50, "Canada": 68, "Australia": 70, "New Zealand": 77, "UAE": 185, "Russia": 4000 },
    works: true, customs: true, fragile: false, weekOne: true,
    note: ""
  },
  {
    name: "Winter jacket", category: "Clothing", need: "Must", weightKg: 1.5, priceIndia: 6000,
    prices: { "Germany": 60, "UK": 50, "US": 70, "France": 60, "Spain": 57, "Italy": 60, "Ireland": 66, "Canada": 94, "Australia": 100, "New Zealand": 110, "UAE": 259, "Russia": 6000 },
    works: true, customs: true, fragile: false, weekOne: false,
    note: "Winter-grade jackets are better value and quality abroad."
  },
  {
    name: "Electric kettle", category: "Appliances", need: "Nice", weightKg: 1, priceIndia: 1200,
    prices: { "Germany": 25, "UK": 20, "US": 25, "France": 25, "Spain": 24, "Italy": 25, "Ireland": 28, "Canada": 34, "Australia": 35, "New Zealand": 38, "UAE": 92, "Russia": 2000 },
    works: false, customs: true, fragile: false, weekOne: true,
    note: "Plug/voltage differ; adapter or converter needed."
  },
  {
    name: "Spices & masalas (sealed packs)", category: "Spices (sealed)", need: "Must", weightKg: 2, priceIndia: 1500,
    prices: { "Germany": 40, "UK": 30, "US": 40, "France": 40, "Spain": 38, "Italy": 40, "Ireland": 44, "Canada": 54, "Australia": 60, "New Zealand": 66, "UAE": 148, "Russia": 3000 },
    works: true, customs: true, fragile: false, weekOne: true,
    note: "Only sealed, branded, factory-packed spices. No loose or homemade masala. Declare in Australia."
  },
  {
    name: "Bedding & pillows", category: "Bedding", need: "Must", weightKg: 4, priceIndia: 3000,
    prices: { "Germany": 40, "UK": 35, "US": 50, "France": 40, "Spain": 38, "Italy": 40, "Ireland": 44, "Canada": 68, "Australia": 70, "New Zealand": 77, "UAE": 185, "Russia": 4000 },
    works: true, customs: true, fragile: false, weekOne: true,
    note: ""
  },
  {
    name: "Stationery", category: "Stationery", need: "Nice", weightKg: 1, priceIndia: 500,
    prices: { "Germany": 20, "UK": 15, "US": 20, "France": 20, "Spain": 19, "Italy": 20, "Ireland": 22, "Canada": 27, "Australia": 30, "New Zealand": 33, "UAE": 74, "Russia": 1500 },
    works: true, customs: true, fragile: false, weekOne: false,
    note: ""
  },
  {
    name: "Clothes iron", category: "Appliances", need: "Optional", weightKg: 1.2, priceIndia: 1000,
    prices: { "Germany": 20, "UK": 18, "US": 25, "France": 20, "Spain": 19, "Italy": 20, "Ireland": 22, "Canada": 34, "Australia": 30, "New Zealand": 33, "UAE": 92, "Russia": 2000 },
    works: true, customs: true, fragile: false, weekOne: false,
    note: ""
  },
  {
    name: "Shampoo & conditioner", category: "Toiletries", need: "Nice", weightKg: 0.8, priceIndia: 500,
    prices: { "Germany": 8, "UK": 6, "US": 8, "France": 8, "Spain": 8, "Italy": 8, "Ireland": 9, "Canada": 11, "Australia": 12, "New Zealand": 13, "UAE": 30, "Russia": 500 },
    works: true, customs: true, fragile: false, weekOne: true,
    note: "Liquids over 100 ml go in the checked bag; tape the caps."
  },
  {
    name: "Toothpaste & toothbrush", category: "Toiletries", need: "Must", weightKg: 0.3, priceIndia: 200,
    prices: { "Germany": 4, "UK": 3, "US": 5, "France": 4, "Spain": 4, "Italy": 4, "Ireland": 4, "Canada": 7, "Australia": 6, "New Zealand": 7, "UAE": 18, "Russia": 300 },
    works: true, customs: true, fragile: false, weekOne: true,
    note: "Carry a small set for week 1."
  },
  {
    name: "Soap & body wash", category: "Toiletries", need: "Nice", weightKg: 0.5, priceIndia: 250,
    prices: { "Germany": 5, "UK": 4, "US": 6, "France": 5, "Spain": 5, "Italy": 5, "Ireland": 6, "Canada": 8, "Australia": 8, "New Zealand": 9, "UAE": 22, "Russia": 400 },
    works: true, customs: true, fragile: false, weekOne: true,
    note: ""
  },
  {
    name: "Sanitary pads (1 month)", category: "Toiletries", need: "Must", weightKg: 0.6, priceIndia: 400,
    prices: { "Germany": 6, "UK": 5, "US": 8, "France": 6, "Spain": 6, "Italy": 6, "Ireland": 7, "Canada": 11, "Australia": 9, "New Zealand": 10, "UAE": 30, "Russia": 500 },
    works: true, customs: true, fragile: false, weekOne: true,
    note: "Bring your usual brand for the first month."
  },
  {
    name: "Hair oil (coconut)", category: "Toiletries", need: "Nice", weightKg: 0.5, priceIndia: 250,
    prices: { "Germany": 8, "UK": 6, "US": 8, "France": 8, "Spain": 8, "Italy": 8, "Ireland": 9, "Canada": 11, "Australia": 10, "New Zealand": 11, "UAE": 30, "Russia": 600 },
    works: true, customs: true, fragile: false, weekOne: false,
    note: "Seal the cap; checked bag."
  },
  {
    name: "Kajal / kohl pencil", category: "Makeup (basic)", need: "Nice", weightKg: 0.05, priceIndia: 250,
    prices: { "Germany": 8, "UK": 6, "US": 8, "France": 8, "Spain": 8, "Italy": 8, "Ireland": 9, "Canada": 11, "Australia": 12, "New Zealand": 13, "UAE": 30, "Russia": 600 },
    works: true, customs: true, fragile: false, weekOne: false,
    note: ""
  },
  {
    name: "Lipstick (1-2)", category: "Makeup (basic)", need: "Nice", weightKg: 0.05, priceIndia: 600,
    prices: { "Germany": 12, "UK": 10, "US": 12, "France": 12, "Spain": 11, "Italy": 12, "Ireland": 13, "Canada": 16, "Australia": 18, "New Zealand": 20, "UAE": 44, "Russia": 900 },
    works: true, customs: true, fragile: false, weekOne: false,
    note: ""
  },
  {
    name: "Compact / foundation", category: "Makeup (basic)", need: "Nice", weightKg: 0.1, priceIndia: 700,
    prices: { "Germany": 15, "UK": 12, "US": 15, "France": 15, "Spain": 14, "Italy": 15, "Ireland": 16, "Canada": 20, "Australia": 22, "New Zealand": 24, "UAE": 56, "Russia": 1200 },
    works: true, customs: true, fragile: true, weekOne: false,
    note: "Shade match is easier with brands you already use."
  },
  {
    name: "Sunscreen SPF 50", category: "Makeup (basic)", need: "Must", weightKg: 0.2, priceIndia: 500,
    prices: { "Germany": 12, "UK": 10, "US": 12, "France": 12, "Spain": 11, "Italy": 12, "Ireland": 13, "Canada": 16, "Australia": 15, "New Zealand": 16, "UAE": 44, "Russia": 900 },
    works: true, customs: true, fragile: false, weekOne: true,
    note: "Over 100 ml goes in the checked bag."
  },
  {
    name: "Moisturiser", category: "Makeup (basic)", need: "Nice", weightKg: 0.2, priceIndia: 350,
    prices: { "Germany": 8, "UK": 7, "US": 9, "France": 8, "Spain": 8, "Italy": 8, "Ireland": 9, "Canada": 12, "Australia": 12, "New Zealand": 13, "UAE": 33, "Russia": 600 },
    works: true, customs: true, fragile: false, weekOne: false,
    note: ""
  },
  {
    name: "Ready-to-eat meals & noodles (veg, sealed)", category: "Packed food", need: "Nice", weightKg: 2, priceIndia: 600,
    prices: { "Germany": 15, "UK": 12, "US": 16, "France": 15, "Spain": 14, "Italy": 15, "Ireland": 16, "Canada": 22, "Australia": 25, "New Zealand": 28, "UAE": 59, "Russia": 1200 },
    works: true, customs: true, fragile: false, weekOne: true,
    note: "Sealed, factory-packed, vegetarian only. Declare food in Australia."
  },
  {
    name: "Biscuits & namkeen (sealed)", category: "Packed food", need: "Nice", weightKg: 1.5, priceIndia: 400,
    prices: { "Germany": 12, "UK": 10, "US": 12, "France": 12, "Spain": 11, "Italy": 12, "Ireland": 13, "Canada": 16, "Australia": 18, "New Zealand": 20, "UAE": 44, "Russia": 900 },
    works: true, customs: true, fragile: false, weekOne: true,
    note: "Sealed packs only."
  },
  {
    name: "Tea & coffee (sealed)", category: "Packed food", need: "Nice", weightKg: 0.5, priceIndia: 300,
    prices: { "Germany": 8, "UK": 6, "US": 8, "France": 8, "Spain": 8, "Italy": 8, "Ireland": 9, "Canada": 11, "Australia": 12, "New Zealand": 13, "UAE": 30, "Russia": 600 },
    works: true, customs: true, fragile: false, weekOne: true,
    note: "Sealed packs only."
  },
  {
    name: "Pickle (sealed jar)", category: "Packed food", need: "Optional", weightKg: 1, priceIndia: 300,
    prices: { "Germany": 8, "UK": 6, "US": 8, "France": 8, "Spain": 8, "Italy": 8, "Ireland": 9, "Canada": 11, "Australia": 12, "New Zealand": 13, "UAE": 30, "Russia": 700 },
    works: true, customs: true, fragile: true, weekOne: false,
    note: "Oil leaks: double-bag. Declare in Australia."
  },
  {
    name: "Ghee", category: "Milk products", need: "Must", weightKg: 1, priceIndia: 600,
    prices: { "Germany": 10, "UK": 8, "US": 10, "France": 10, "Spain": 10, "Italy": 10, "Ireland": 11, "Canada": 14, "Australia": 15, "New Zealand": 16, "UAE": 37, "Russia": 800 },
    works: true, customs: false, fragile: false, weekOne: false,
    note: "Milk products from India are not allowed into the EU/UK; restricted or must be declared in the US, Australia and Russia."
  },
  {
    name: "Milk powder", category: "Milk products", need: "Nice", weightKg: 0.5, priceIndia: 300,
    prices: { "Germany": 6, "UK": 5, "US": 7, "France": 6, "Spain": 6, "Italy": 6, "Ireland": 7, "Canada": 9, "Australia": 9, "New Zealand": 10, "UAE": 26, "Russia": 500 },
    works: true, customs: false, fragile: false, weekOne: false,
    note: "Same rule as ghee."
  },
  {
    name: "Paneer / cheese", category: "Milk products", need: "Nice", weightKg: 0.5, priceIndia: 200,
    prices: { "Germany": 4, "UK": 3, "US": 5, "France": 4, "Spain": 4, "Italy": 4, "Ireland": 4, "Canada": 7, "Australia": 7, "New Zealand": 8, "UAE": 18, "Russia": 400 },
    works: true, customs: false, fragile: false, weekOne: false,
    note: "Same rule as ghee; also spoils."
  },
  {
    name: "Milk sweets (peda, barfi)", category: "Milk products", need: "Optional", weightKg: 1, priceIndia: 500,
    prices: { "Germany": 15, "UK": 12, "US": 15, "France": 15, "Spain": 14, "Italy": 15, "Ireland": 16, "Canada": 20, "Australia": 20, "New Zealand": 22, "UAE": 56, "Russia": 1000 },
    works: true, customs: false, fragile: false, weekOne: false,
    note: "Same rule as ghee."
  },
  {
    name: "Prescribed medicines (3-month supply)", category: "Medicines", need: "Must", weightKg: 0.5, priceIndia: 1500,
    prices: { "Germany": 60, "UK": 45, "US": 100, "France": 50, "Spain": 45, "Italy": 50, "Ireland": 60, "Canada": 90, "Australia": 70, "New Zealand": 70, "UAE": 200, "Russia": 3000 },
    works: true, customs: true, fragile: false, weekOne: true,
    note: "Original packs + doctor's prescription in English. Many countries cap personal supply (often ~3 months). Some medicines (e.g. codeine-based) need approval in the UAE: check the list."
  },
  {
    name: "Basic first-aid kit (bandages, antiseptic, thermometer)", category: "Medicines", need: "Must", weightKg: 0.4, priceIndia: 500,
    prices: { "Germany": 15, "UK": 12, "US": 15, "France": 15, "Spain": 14, "Italy": 15, "Ireland": 16, "Canada": 20, "Australia": 20, "New Zealand": 22, "UAE": 55, "Russia": 1000 },
    works: true, customs: true, fragile: false, weekOne: true,
    note: "Hard to find quickly in week 1; light to carry."
  },
  {
    name: "Everyday OTC medicines your doctor advises (fever, ORS, antacid)", category: "Medicines", need: "Must", weightKg: 0.3, priceIndia: 300,
    prices: { "Germany": 10, "UK": 8, "US": 12, "France": 10, "Spain": 9, "Italy": 10, "Ireland": 11, "Canada": 15, "Australia": 15, "New Zealand": 16, "UAE": 40, "Russia": 700 },
    works: true, customs: true, fragile: false, weekOne: true,
    note: "Only what your doctor recommends, in original packs. The agent never suggests or substitutes medicines."
  },
  {
    name: "Spare glasses / contact lenses", category: "Eye care", need: "Nice", weightKg: 0.2, priceIndia: 1500,
    prices: { "Germany": 80, "UK": 60, "US": 100, "France": 80, "Spain": 75, "Italy": 80, "Ireland": 90, "Canada": 130, "Australia": 120, "New Zealand": 130, "UAE": 300, "Russia": 6000 },
    works: true, customs: true, fragile: true, weekOne: false,
    note: "Carry your lens prescription; replacements abroad need a local eye test and cost more."
  }
];
