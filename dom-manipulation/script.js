const API_URL = "https://jsonplaceholder.typicode.com/posts";

// ==========================
// Local Variables and State
// ==========================
let quotes = [];

// ==========================
// Storage Functions
// ==========================
function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    try {
      quotes = JSON.parse(stored);
    } catch {
      quotes = [];
    }
  } else {
    quotes = [
      { text: "The best way to predict the future is to invent it.", category: "Motivation" },
      { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" },
      { text: "Knowledge is power.", category: "Education" }
    ];
  }
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ==========================
// DOM + UI
// ==========================
function getSelectedCategory() {
  return document.getElementById("categoryFilter").value;
}

function showRandomQuote() {
  const selected = getSelectedCategory();
  const filtered = selected === "all" ? quotes : quotes.filter(q => q.category === selected);

  if (filtered.length === 0) {
    document.getElementById("quoteDisplay").textContent = "No quotes in this category.";
    return;
  }

  const index = Math.floor(Math.random() * filtered.length);
  const quote = filtered[index];
  const display = `<strong>${quote.category}:</strong> "${quote.text}"`;

  document.getElementById("quoteDisplay").innerHTML = display;

  sessionStorage.setItem("lastViewedQuote", display);
  updateLastViewedDisplay();
}

function updateLastViewedDisplay() {
  const lastViewed = sessionStorage.getItem("lastViewedQuote");
  if (lastViewed) {
    document.getElementById("lastViewed").innerHTML = "Last viewed quote: " + lastViewed;
  }
}

async function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both quote and category.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added successfully!");

  // POST to server
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newQuote)
    });
    showSyncMessage("Quote posted to server.", "green");
  } catch (error) {
    console.error("Error posting to server:", error);
    showSyncMessage("Failed to sync quote with server.", "red");
  }
}

function createAddQuoteForm() {
  const form = document.getElementById("addQuoteForm");

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.placeholder = "Enter a new quote";
  form.appendChild(textInput);

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";
  form.appendChild(categoryInput);

  const button = document.createElement("button");
  button.textContent = "Add Quote";
  button.onclick = addQuote;
  form.appendChild(button);
}

function populateCategories() {
  const dropdown = document.getElementById("categoryFilter");
  const current = dropdown.value;

  const categories = [...new Set(quotes.map(q => q.category))];

  dropdown.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    dropdown.appendChild(option);
  });

  const saved = localStorage.getItem("selectedCategory");
  if (saved && dropdown.querySelector(`[value="${saved}"]`)) {
    dropdown.value = saved;
  } else {
    dropdown.value = current || "all";
  }
}

function filterQuotes() {
  const selected = getSelectedCategory();
  localStorage.setItem("selectedCategory", selected);
  showRandomQuote();
}

// ==========================
// JSON Import / Export
// ==========================
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();

  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format.");
      }
    } catch {
      alert("Failed to parse JSON file.");
    }
  };
  reader.readAsText(file);
}

// ==========================
// Server Sync & Conflict Resolution
// ==========================
function showSyncMessage(message, color = "green") {
  const statusDiv = document.getElementById("syncStatus");
  if (statusDiv) {
    statusDiv.textContent = message;
    statusDiv.style.color = color;
    setTimeout(() => { statusDiv.textContent = ""; }, 5000);
  }
}

// This function fetches quotes from the server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(API_URL);
    const serverData = await response.json();

    const serverQuotes = serverData
      .map(item => ({
        text: item.title || item.body,
        category: item.body ? "Imported" : "General"
      }))
      .slice(0, 10); // limit for demo

    return serverQuotes;
  } catch (error) {
    console.error("Failed to fetch quotes from server:", error);
    return [];
  }
}

async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();

  const newServerQuotes = serverQuotes.filter(sq =>
    !quotes.some(lq => lq.text === sq.text && lq.category === sq.category)
  );

  if (newServerQuotes.length > 0) {
    quotes.push(...newServerQuotes);
    saveQuotes();
    populateCategories();
    filterQuotes();
    showSyncMessage("Quotes synced with server!", "blue");
  } else {
    showSyncMessage("No new updates from server.", "gray");
  }
}

function startSyncQuotes() {
  syncQuotes();
  setInterval(syncQuotes, 30000);
}

// ==========================
// Initialization
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();
  updateLastViewedDisplay();
  showRandomQuote();
  startSyncQuotes();
});

document.getElementById("newQuote").addEventListener("click", showRandomQuote);
