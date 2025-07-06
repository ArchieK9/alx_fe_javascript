let quotes = [];

// Load quotes from localStorage
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

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Get current selected category
function getSelectedCategory() {
  return document.getElementById("categoryFilter").value;
}

// Filter and display a random quote
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

  // Save to sessionStorage
  sessionStorage.setItem("lastViewedQuote", display);
  updateLastViewedDisplay();
}

// Display last viewed quote
function updateLastViewedDisplay() {
  const lastViewed = sessionStorage.getItem("lastViewedQuote");
  if (lastViewed) {
    document.getElementById("lastViewed").innerHTML = "Last viewed quote: " + lastViewed;
  }
}

// Add a new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both quote and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories(); // update dropdown

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added successfully!");
}

// Dynamically create form
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

// Populate categories in dropdown
function populateCategories() {
  const dropdown = document.getElementById("categoryFilter");
  const current = dropdown.value;

  // Get unique categories
  const categories = [...new Set(quotes.map(q => q.category))];
  
  // Clear and repopulate
  dropdown.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    dropdown.appendChild(option);
  });

  // Restore previous filter
  const saved = localStorage.getItem("selectedCategory");
  if (saved && dropdown.querySelector(`[value="${saved}"]`)) {
    dropdown.value = saved;
  } else {
    dropdown.value = current || "all";
  }
}

// Filter quotes by selected category
function filterQuotes() {
  const selected = getSelectedCategory();
  localStorage.setItem("selectedCategory", selected);
  showRandomQuote(); // Show filtered quote
}

// Export quotes to JSON file
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

// Import from JSON file
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

// On load
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();
  updateLastViewedDisplay();
  showRandomQuote();
});

document.getElementById("newQuote").addEventListener("click", showRandomQuote);
