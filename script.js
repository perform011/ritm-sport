const products = [
  { id: 'amflow-px', name: 'Bicicletă electrică MTB Amflow PX Carbon Pro 29"/27.5" 2026', brand: 'AMFLOW', category: 'Ciclism', price: 11108.93, image: 'public/products/amflow.webp', badge: 'NOU' },
  { id: 'garmin-170', name: 'Ceas Garmin Forerunner 170 Music', brand: 'GARMIN', category: 'Ceasuri & GPS', price: 389.76, image: 'public/products/garmin-170.webp', badge: 'NOU' },
  { id: 'hoka-skyward', name: 'Pantofi alergare damă Hoka Skyward X 2', brand: 'HOKA', category: 'Alergare', price: 210.02, oldPrice: 262.53, image: 'public/products/hoka-skyward.webp', badge: '−20%' },
  { id: 'dahon-boardwalk', name: 'Bicicletă pliabilă Dahon Boardwalk D7 16"', brand: 'DAHON', category: 'Ciclism', price: 805.88, image: 'public/products/dahon.webp' },
  { id: 'hoka-zinal', name: 'Pantofi alergare trail damă Hoka Zinal 3', brand: 'HOKA', category: 'Alergare', price: 136.60, oldPrice: 181.92, image: 'public/products/hoka-zinal.webp', badge: '−25%' },
  { id: 'shokz-opendots', name: 'Căști audio Shokz OpenDots One', brand: 'SHOKZ', category: 'Audio', price: 213.70, oldPrice: 229.85, image: 'public/products/shokz.webp', badge: '−7%' },
  { id: 'oakley-sphaera', name: "Ochelari Oakley Sphaera Strike Giro d'Italia 2026", brand: 'OAKLEY', category: 'Ciclism', price: 207.93, oldPrice: 259.91, image: 'public/products/oakley-glasses.webp', badge: '−20%' },
  { id: 'oakley-stelvio', name: 'Cască ciclism Oakley Velo Stelvio MIPS', brand: 'OAKLEY', category: 'Ciclism', price: 311.67, oldPrice: 366.67, image: 'public/products/oakley-helmet.webp', badge: '−15%' },
  { id: 'garmin-instinct', name: 'Ceas Garmin Instinct 3 Solar Tactical, 45 mm', brand: 'GARMIN', category: 'Ceasuri & GPS', price: 446.41, oldPrice: 496.51, image: 'public/products/garmin-instinct.webp', badge: '−10%' },
  { id: 'garmin-970', name: 'Ceas Garmin Forerunner 970 AMOLED', brand: 'GARMIN', category: 'Ceasuri & GPS', price: 740.52, oldPrice: 823.75, image: 'public/products/garmin-970.webp', badge: '−10%' },
  { id: 'mizuno-alpha', name: 'Ghete fotbal Mizuno Alpha III Elite Mix SS 2026', brand: 'MIZUNO', category: 'Fotbal', price: 153.38, oldPrice: 255.56, image: 'public/products/mizuno-alpha.webp', badge: '−40%' },
  { id: 'asics-kayano', name: 'Pantofi alergare damă Asics Gel-Kayano 32 Sunny Sizzle', brand: 'ASICS', category: 'Alergare', price: 155.56, oldPrice: 222.22, image: 'public/products/asics-kayano.webp', badge: '−30%' },
  { id: 'oakley-jersey', name: 'Bluză ciclism bărbați Oakley Icon Training', brand: 'OAKLEY', category: 'Ciclism', price: 116.78, oldPrice: 145.98, image: 'public/products/oakley-jersey.webp', badge: '−20%', checkoutUrl: 'https://whop.com/ritm-sport/oakley-icon-training/' },
  { id: 'on-cloudmonster', name: 'Pantofi alergare damă ON Cloudmonster 3', brand: 'ON', category: 'Alergare', price: 166.67, oldPrice: 222.22, image: 'public/products/on-cloudmonster.webp', badge: '−25%' },
  { id: 'adidas-supernova', name: 'Pantofi alergare bărbați Adidas Supernova Rise 3', brand: 'ADIDAS', category: 'Alergare', price: 124.18, oldPrice: 163.40, image: 'public/products/adidas-supernova.webp', badge: '−24%' },
  { id: 'puma-deviate', name: 'Pantofi Puma Deviate Nitro Elite 4 Showtime', brand: 'PUMA', category: 'Alergare', price: 190.63, oldPrice: 272.11, image: 'public/products/puma-deviate.webp', badge: '−30%' }
];

const STORAGE_KEYS = {
  cart: 'ritm-sport-cart',
  customer: 'ritm-sport-customer',
  orders: 'ritm-sport-orders'
};

const orderStatuses = ['Comandă plasată', 'Confirmată', 'În tranzit', 'Livrată'];
const shippingPrice = 12.90;
const freeShippingFrom = 150;

const grid = document.querySelector('#product-grid');
const search = document.querySelector('#search');
const count = document.querySelector('#result-count');
const emptyState = document.querySelector('#empty-state');
const resetButton = document.querySelector('#reset-filters');
const filterButtons = [...document.querySelectorAll('[data-category]')];
const pageOverlay = document.querySelector('#page-overlay');
const cartPanel = document.querySelector('#cart-panel');
const accountPanel = document.querySelector('#account-panel');
const checkoutModal = document.querySelector('#checkout-modal');
const cartButton = document.querySelector('#cart-button');
const accountButton = document.querySelector('#account-button');
const accountButtonLabel = document.querySelector('#account-button-label');
const cartCount = document.querySelector('#cart-count');
const cartItems = document.querySelector('#cart-items');
const cartSubtotal = document.querySelector('#cart-subtotal');
const cartShipping = document.querySelector('#cart-shipping');
const cartTotal = document.querySelector('#cart-total');
const checkoutButton = document.querySelector('#checkout-button');
const checkoutForm = document.querySelector('#checkout-form');
const checkoutTotal = document.querySelector('#checkout-total');
const accountContent = document.querySelector('#account-content');
const toast = document.querySelector('#toast');
const layers = [cartPanel, accountPanel, checkoutModal];

let activeCategory = 'Toate';
let toastTimer;
let lastFocusedElement;

function loadJSON(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (error) {
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    showToast('Browserul nu a putut salva datele local.');
  }
}

let cart = loadJSON(STORAGE_KEYS.cart, []).filter((item) => products.some((product) => product.id === item.productId));
let customer = loadJSON(STORAGE_KEYS.customer, null);
let orders = loadJSON(STORAGE_KEYS.orders, []);

function escapeHTML(value = '') {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  })[character]);
}

function formatMoney(value) {
  return `$${Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat('ro-RO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value));
}

function productCard(product) {
  return `
    <article class="product-card">
      <div class="product-image">
        ${product.badge ? `<span class="badge">${product.badge}</span>` : ''}
        <img src="${product.image}" alt="${escapeHTML(product.name)}" loading="lazy" />
      </div>
      <div class="product-content">
        <div class="product-meta">
          <span>${product.brand}</span>
          <span>${product.category}</span>
        </div>
        <h2>${escapeHTML(product.name)}</h2>
        <div class="product-actions">
          <div class="price">
            <strong>${formatMoney(product.price)}</strong>
            ${product.oldPrice ? `<s>${formatMoney(product.oldPrice)}</s>` : ''}
          </div>
          ${product.checkoutUrl
            ? `<a class="buy-button" href="${product.checkoutUrl}" target="_blank" rel="noopener noreferrer" aria-label="Cumpără ${escapeHTML(product.name)} prin Whop">Cumpără</a>`
            : `<button class="add-button" type="button" data-add-to-cart="${product.id}" aria-label="Adaugă ${escapeHTML(product.name)} în coș">+</button>`}
        </div>
      </div>
    </article>`;
}

function renderProducts() {
  const term = search.value.trim().toLocaleLowerCase('ro');
  const filtered = products.filter((product) => {
    const matchesCategory = activeCategory === 'Toate' || product.category === activeCategory;
    const haystack = `${product.name} ${product.brand} ${product.category}`.toLocaleLowerCase('ro');
    return matchesCategory && haystack.includes(term);
  });

  grid.innerHTML = filtered.map(productCard).join('');
  count.textContent = `${filtered.length} ${filtered.length === 1 ? 'produs' : 'produse'}`;
  emptyState.hidden = filtered.length !== 0;
}

function getCartTotals() {
  const subtotal = cart.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
  const shipping = subtotal === 0 || subtotal >= freeShippingFrom ? 0 : shippingPrice;
  return { subtotal, shipping, total: subtotal + shipping };
}

function updateCartSummary() {
  const numberOfItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totals = getCartTotals();
  cartCount.textContent = numberOfItems;
  cartCount.setAttribute('aria-label', `${numberOfItems} produse în coș`);
  cartSubtotal.textContent = formatMoney(totals.subtotal);
  cartShipping.textContent = totals.subtotal === 0 ? '—' : totals.shipping === 0 ? 'Gratuită' : formatMoney(totals.shipping);
  cartTotal.textContent = formatMoney(totals.total);
  checkoutTotal.textContent = formatMoney(totals.total);
  checkoutButton.disabled = cart.length === 0;
}

function renderCart() {
  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <span aria-hidden="true">◎</span>
        <strong>Coșul este gol</strong>
        <p>Adaugă produsele preferate, apoi revino aici pentru a finaliza comanda.</p>
      </div>`;
    updateCartSummary();
    return;
  }

  cartItems.innerHTML = cart.map((item) => {
    const product = products.find((entry) => entry.id === item.productId);
    if (!product) return '';
    return `
      <article class="cart-item">
        <div class="cart-item-image"><img src="${product.image}" alt="" /></div>
        <div class="cart-item-info">
          <h3>${escapeHTML(product.name)}</h3>
          <span>${formatMoney(product.price * item.quantity)}</span>
          <div class="quantity-control" aria-label="Cantitate">
            <button type="button" data-cart-action="decrease" data-product-id="${product.id}" aria-label="Scade cantitatea">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-cart-action="increase" data-product-id="${product.id}" aria-label="Mărește cantitatea">+</button>
          </div>
        </div>
        <button class="remove-button" type="button" data-cart-action="remove" data-product-id="${product.id}">Șterge</button>
      </article>`;
  }).join('');
  updateCartSummary();
}

function addToCart(productId) {
  const existing = cart.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity = Math.min(existing.quantity + 1, 10);
  } else {
    cart.push({ productId, quantity: 1 });
  }
  saveJSON(STORAGE_KEYS.cart, cart);
  renderCart();
  showToast('Produsul a fost adăugat în coș.');
}

function changeCart(productId, action) {
  const item = cart.find((entry) => entry.productId === productId);
  if (!item) return;

  if (action === 'increase') item.quantity = Math.min(item.quantity + 1, 10);
  if (action === 'decrease') item.quantity -= 1;
  if (action === 'remove' || item.quantity <= 0) {
    cart = cart.filter((entry) => entry.productId !== productId);
  }

  saveJSON(STORAGE_KEYS.cart, cart);
  renderCart();
}

function showLayer(layer) {
  lastFocusedElement = document.activeElement;
  layers.forEach((item) => {
    item.hidden = item !== layer;
    if (item.matches('.side-panel')) item.setAttribute('aria-hidden', String(item !== layer));
  });
  pageOverlay.hidden = false;
  document.body.classList.add('layer-open');
  window.setTimeout(() => layer.querySelector('input, button, select')?.focus(), 0);
}

function closeLayers() {
  layers.forEach((layer) => {
    layer.hidden = true;
    if (layer.matches('.side-panel')) layer.setAttribute('aria-hidden', 'true');
  });
  pageOverlay.hidden = true;
  document.body.classList.remove('layer-open');
  lastFocusedElement?.focus();
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = window.setTimeout(() => {
    toast.hidden = true;
  }, 2800);
}

function normalizeEmail(email) {
  return String(email).trim().toLocaleLowerCase('ro');
}

function customerOrders() {
  if (!customer) return [];
  const email = normalizeEmail(customer.email);
  return orders.filter((order) => normalizeEmail(order.customerEmail) === email);
}

function createUniqueOrderCode() {
  let code;
  do {
    code = `RTM-${Math.floor(10000 + Math.random() * 90000)}`;
  } while (orders.some((order) => order.id === code));
  return code;
}

function ensureDemoOrders() {
  if (!customer || customerOrders().length > 0) return;

  const demoOrders = [
    {
      id: createUniqueOrderCode(),
      createdAt: '2026-08-08T10:30:00.000Z',
      customerEmail: customer.email,
      items: [
        { productId: 'garmin-170', name: products[1].name, price: products[1].price, quantity: 1 },
        { productId: 'on-cloudmonster', name: products[13].name, price: products[13].price, quantity: 1 }
      ],
      subtotal: 556.43,
      shipping: 0,
      total: 556.43,
      statusIndex: 2,
      expectedDelivery: '13 august 2026'
    },
    {
      id: createUniqueOrderCode(),
      createdAt: '2026-07-24T12:00:00.000Z',
      customerEmail: customer.email,
      items: [
        { productId: 'asics-kayano', name: products[11].name, price: products[11].price, quantity: 1 }
      ],
      subtotal: 155.56,
      shipping: 0,
      total: 155.56,
      statusIndex: 3,
      expectedDelivery: 'Livrată pe 29 iulie 2026'
    }
  ];

  orders = [...demoOrders, ...orders];
  saveJSON(STORAGE_KEYS.orders, orders);
}

function orderCard(order, compact = false) {
  const statusIndex = Math.max(0, Math.min(Number(order.statusIndex) || 0, orderStatuses.length - 1));
  const delivered = statusIndex === orderStatuses.length - 1;
  const progress = (statusIndex / (orderStatuses.length - 1)) * 100;
  const items = Array.isArray(order.items) ? order.items : [];

  return `
    <article class="order-card${compact ? ' compact' : ''}">
      <div class="order-top">
        <div>
          <strong class="order-code">${escapeHTML(order.id)}</strong>
          <span class="order-date">${formatDate(order.createdAt)}</span>
        </div>
        <div class="order-total">
          <strong>${formatMoney(order.total)}</strong>
          <span class="status-pill${delivered ? ' delivered' : ''}">${orderStatuses[statusIndex]}</span>
        </div>
      </div>
      <div class="order-products">
        ${items.map((item) => `
          <div class="order-product">
            <span>${escapeHTML(item.name)} × ${item.quantity}</span>
            <strong>${formatMoney(item.price * item.quantity)}</strong>
          </div>`).join('')}
      </div>
      <div class="order-progress">
        <div class="progress-track">
          <div class="progress-fill" style="width: ${progress}%"></div>
          <div class="progress-steps">
            ${orderStatuses.map((status, index) => `<i class="progress-dot${index <= statusIndex ? ' done' : ''}" aria-label="${status}"></i>`).join('')}
          </div>
        </div>
        <div class="progress-labels">
          ${orderStatuses.map((status) => `<span>${status}</span>`).join('')}
        </div>
        <p class="delivery-note">${delivered ? escapeHTML(order.expectedDelivery) : `Livrare estimată: <strong>${escapeHTML(order.expectedDelivery)}</strong>`}</p>
      </div>
    </article>`;
}

function initials(name) {
  return String(name).trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'RS';
}

function updateAccountButton() {
  accountButtonLabel.textContent = customer ? customer.name.split(/\s+/)[0] : 'Contul meu';
}

function renderLogin() {
  accountContent.innerHTML = `
    <div class="login-view">
      <h3>Bine ai revenit.</h3>
      <p>Intră în cont pentru a vedea comenzile curente și traseul livrării. La prima conectare adăugăm două comenzi demonstrative.</p>
      <form id="login-form" class="login-form">
        <label class="field">
          <span>Nume</span>
          <input name="name" type="text" autocomplete="name" required />
        </label>
        <label class="field">
          <span>E-mail</span>
          <input name="email" type="email" autocomplete="email" required />
        </label>
        <label class="field">
          <span>Parolă</span>
          <input name="password" type="password" autocomplete="current-password" minlength="4" required />
        </label>
        <button class="primary-button" type="submit">Intră în cont</button>
        <p class="form-disclaimer">Cont demonstrativ local. Parola nu este transmisă și nu este salvată.</p>
      </form>
    </div>`;

  document.querySelector('#login-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    customer = {
      name: String(formData.get('name')).trim(),
      email: normalizeEmail(formData.get('email'))
    };
    saveJSON(STORAGE_KEYS.customer, customer);
    ensureDemoOrders();
    updateAccountButton();
    renderAccount();
    showToast('Ai intrat în cont.');
  });
}

function renderAccount() {
  if (!customer) {
    renderLogin();
    return;
  }

  const allOrders = customerOrders().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const activeOrders = allOrders.filter((order) => Number(order.statusIndex) < 3);
  const completedOrders = allOrders.filter((order) => Number(order.statusIndex) >= 3);

  accountContent.innerHTML = `
    <div class="account-dashboard">
      <div class="account-hero">
        <div class="account-identity">
          <span class="account-avatar">${escapeHTML(initials(customer.name))}</span>
          <div>
            <strong>${escapeHTML(customer.name)}</strong>
            <span>${escapeHTML(customer.email)}</span>
          </div>
        </div>
        <button id="logout-button" class="text-button" type="button">Ieși din cont</button>
      </div>

      <section class="account-section">
        <div class="section-heading">
          <h3>Urmărește o comandă</h3>
        </div>
        <form id="tracking-form" class="tracking-form">
          <input name="orderId" type="search" placeholder="Exemplu: ${escapeHTML(allOrders[0]?.id || 'RTM-12345')}" aria-label="Numărul comenzii" required />
          <button class="secondary-button" type="submit">Caută</button>
        </form>
        <div id="tracking-result" class="tracking-result"></div>
      </section>

      <section class="account-section">
        <div class="section-heading">
          <h3>Comenzi în desfășurare</h3>
          <span>${activeOrders.length}</span>
        </div>
        <div class="orders-list">
          ${activeOrders.length ? activeOrders.map((order) => orderCard(order)).join('') : '<p class="no-orders">Nu ai comenzi în desfășurare.</p>'}
        </div>
      </section>

      <section class="account-section">
        <div class="section-heading">
          <h3>Istoric</h3>
          <span>${completedOrders.length}</span>
        </div>
        <div class="orders-list">
          ${completedOrders.length ? completedOrders.map((order) => orderCard(order, true)).join('') : '<p class="no-orders">Istoricul este gol.</p>'}
        </div>
      </section>
    </div>`;

  document.querySelector('#logout-button').addEventListener('click', () => {
    customer = null;
    try {
      localStorage.removeItem(STORAGE_KEYS.customer);
    } catch (error) {
      // The current page can still sign out when storage is unavailable.
    }
    updateAccountButton();
    renderAccount();
    showToast('Ai ieșit din cont.');
  });

  document.querySelector('#tracking-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const searchedId = String(formData.get('orderId')).trim().toUpperCase();
    const foundOrder = allOrders.find((order) => order.id.toUpperCase() === searchedId);
    const result = document.querySelector('#tracking-result');
    result.innerHTML = foundOrder
      ? orderCard(foundOrder)
      : '<p class="tracking-error">Comanda nu a fost găsită în acest cont.</p>';
  });
}

function openCheckout() {
  if (cart.length === 0) return;
  const nameInput = document.querySelector('#checkout-name');
  const emailInput = document.querySelector('#checkout-email');
  nameInput.value = customer?.name || '';
  emailInput.value = customer?.email || '';
  updateCartSummary();
  showLayer(checkoutModal);
}

function expectedDeliveryDate() {
  const date = new Date();
  date.setDate(date.getDate() + 4);
  return new Intl.DateTimeFormat('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function placeOrder(event) {
  event.preventDefault();
  if (cart.length === 0) return;

  const formData = new FormData(event.currentTarget);
  const totals = getCartTotals();
  customer = {
    name: String(formData.get('name')).trim(),
    email: normalizeEmail(formData.get('email'))
  };
  saveJSON(STORAGE_KEYS.customer, customer);

  const order = {
    id: createUniqueOrderCode(),
    createdAt: new Date().toISOString(),
    customerEmail: customer.email,
    customerName: customer.name,
    phone: String(formData.get('phone')).trim(),
    address: String(formData.get('address')).trim(),
    city: String(formData.get('city')).trim(),
    postalCode: String(formData.get('postalCode')).trim(),
    payment: String(formData.get('payment')),
    items: cart.map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      return {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      };
    }),
    subtotal: totals.subtotal,
    shipping: totals.shipping,
    total: totals.total,
    statusIndex: 0,
    expectedDelivery: expectedDeliveryDate()
  };

  orders.unshift(order);
  cart = [];
  saveJSON(STORAGE_KEYS.orders, orders);
  saveJSON(STORAGE_KEYS.cart, cart);
  event.currentTarget.reset();
  renderCart();
  renderAccount();
  updateAccountButton();
  showLayer(accountPanel);
  showToast(`Comanda ${order.id} a fost plasată.`);
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeCategory = button.dataset.category;
    filterButtons.forEach((item) => item.classList.toggle('active', item === button));
    renderProducts();
  });
});

search.addEventListener('input', renderProducts);

resetButton.addEventListener('click', () => {
  search.value = '';
  activeCategory = 'Toate';
  filterButtons.forEach((button) => button.classList.toggle('active', button.dataset.category === 'Toate'));
  renderProducts();
});

grid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-add-to-cart]');
  if (button) addToCart(button.dataset.addToCart);
});

cartItems.addEventListener('click', (event) => {
  const button = event.target.closest('[data-cart-action]');
  if (button) changeCart(button.dataset.productId, button.dataset.cartAction);
});

cartButton.addEventListener('click', () => {
  renderCart();
  showLayer(cartPanel);
});

accountButton.addEventListener('click', () => {
  renderAccount();
  showLayer(accountPanel);
});

checkoutButton.addEventListener('click', openCheckout);
checkoutForm.addEventListener('submit', placeOrder);
pageOverlay.addEventListener('click', closeLayers);

document.querySelectorAll('[data-close-layer]').forEach((button) => {
  button.addEventListener('click', closeLayers);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !pageOverlay.hidden) closeLayers();
});

renderProducts();
renderCart();
renderAccount();
updateAccountButton();

if (window.location.hash === '#account') {
  showLayer(accountPanel);
}
