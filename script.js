// ===========================================================
// Spice Junction — Online Food Ordering System
// ===========================================================

const MENU = [
  { id: "burger",   name: "Burger",   price: 120, emoji: "🍔" },
  { id: "pizza",    name: "Pizza",    price: 250, emoji: "🍕" },
  { id: "sandwich", name: "Sandwich", price: 90,  emoji: "🥪" },
  { id: "fries",    name: "Fries",    price: 80,  emoji: "🍟" },
  { id: "juice",    name: "Juice",    price: 60,  emoji: "🧃" },
];

const rupee = (n) => "₹" + n.toLocaleString("en-IN");

// ---------- Render menu cards ----------

const menuGrid = document.getElementById("menuGrid");

MENU.forEach((item) => {
  const card = document.createElement("article");
  card.className = "menu-card";
  card.dataset.itemId = item.id;

  card.innerHTML = `
    <div class="menu-card-top">
      <span class="menu-card-emoji">${item.emoji}</span>
      <div>
        <p class="menu-card-name">${item.name}</p>
        <span class="menu-card-price">${rupee(item.price)} / item</span>
      </div>
    </div>
    <div class="menu-card-controls">
      <label class="check-label">
        <input type="checkbox" class="item-check" data-id="${item.id}">
        Add to order
      </label>
      <div class="qty-stepper">
        <button type="button" class="qty-minus" data-id="${item.id}" aria-label="Decrease quantity">−</button>
        <input type="number" class="qty-input" data-id="${item.id}" value="1" min="1" max="20" inputmode="numeric">
        <button type="button" class="qty-plus" data-id="${item.id}" aria-label="Increase quantity">+</button>
      </div>
    </div>
  `;

  menuGrid.appendChild(card);
});

// ---------- Menu interaction: checkbox + quantity stepper ----------

menuGrid.addEventListener("click", (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  const card = e.target.closest(".menu-card");
  const qtyInput = card.querySelector(".qty-input");
  const checkbox = card.querySelector(".item-check");

  if (e.target.classList.contains("qty-plus")) {
    qtyInput.value = Math.min(20, (parseInt(qtyInput.value, 10) || 1) + 1);
    if (!checkbox.checked) checkbox.checked = true;
    card.classList.toggle("is-selected", checkbox.checked);
  }

  if (e.target.classList.contains("qty-minus")) {
    qtyInput.value = Math.max(1, (parseInt(qtyInput.value, 10) || 1) - 1);
  }
});

menuGrid.addEventListener("change", (e) => {
  if (e.target.classList.contains("item-check")) {
    const card = e.target.closest(".menu-card");
    card.classList.toggle("is-selected", e.target.checked);
  }

  if (e.target.classList.contains("qty-input")) {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 20) val = 20;
    e.target.value = val;
  }
});

// ---------- Validate customer details ----------

const form = document.getElementById("detailsForm");
const nameInput = document.getElementById("custName");
const mobileInput = document.getElementById("custMobile");
const addressInput = document.getElementById("custAddress");

function setError(input, message) {
  const field = input.closest(".field");
  const errorEl = document.getElementById("err-" + input.id);
  field.classList.toggle("has-error", Boolean(message));
  errorEl.textContent = message || "";
}

function validateName() {
  const val = nameInput.value.trim();
  if (val.length < 2) {
    setError(nameInput, "Enter your name (min 2 characters).");
    return false;
  }
  if (!/^[a-zA-Z\s.'-]+$/.test(val)) {
    setError(nameInput, "Name should contain letters only.");
    return false;
  }
  setError(nameInput, "");
  return true;
}

function validateMobile() {
  const val = mobileInput.value.trim().replace(/\s+/g, "");
  if (!/^[6-9]\d{9}$/.test(val)) {
    setError(mobileInput, "Enter a valid 10-digit mobile number.");
    return false;
  }
  setError(mobileInput, "");
  return true;
}

function validateAddress() {
  const val = addressInput.value.trim();
  if (val.length < 8) {
    setError(addressInput, "Enter a complete address.");
    return false;
  }
  setError(addressInput, "");
  return true;
}

nameInput.addEventListener("blur", validateName);
mobileInput.addEventListener("blur", validateMobile);
addressInput.addEventListener("blur", validateAddress);

// ---------- Calculate totals + display order summary ----------

const ticketEmpty = document.getElementById("ticketEmpty");
const ticketContent = document.getElementById("ticketContent");
const ticketItems = document.getElementById("ticketItems");
const ticketCustomer = document.getElementById("ticketCustomer");
const ticketGrandTotal = document.getElementById("ticketGrandTotal");

function getSelectedItems() {
  const selected = [];
  document.querySelectorAll(".menu-card").forEach((card) => {
    const id = card.dataset.itemId;
    const checkbox = card.querySelector(".item-check");
    const qty = parseInt(card.querySelector(".qty-input").value, 10) || 0;
    if (checkbox.checked && qty > 0) {
      const item = MENU.find((m) => m.id === id);
      selected.push({ ...item, qty, subtotal: item.price * qty });
    }
  });
  return selected;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nameOk = validateName();
  const mobileOk = validateMobile();
  const addressOk = validateAddress();

  const items = getSelectedItems();

  if (!items.length) {
    alert("Please select at least one menu item before placing your order.");
    document.getElementById("menu").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (!nameOk || !mobileOk || !addressOk) return;

  // Item-wise subtotal
  ticketItems.innerHTML = "";
  let grandTotal = 0;

  items.forEach((item) => {
    grandTotal += item.subtotal;
    const line = document.createElement("div");
    line.className = "ticket-row";
    line.innerHTML = `
      <span>${item.name} x${item.qty}</span>
      <span>${rupee(item.subtotal)}</span>
    `;
    ticketItems.appendChild(line);
  });

  // Grand Total + Order Summary + Thank You message
  ticketCustomer.textContent = nameInput.value.trim();
  ticketGrandTotal.textContent = rupee(grandTotal);

  ticketEmpty.hidden = true;
  ticketContent.hidden = false;

  document.getElementById("summary").scrollIntoView({ behavior: "smooth", block: "start" });
});