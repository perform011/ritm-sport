import { getSupabaseClient, isSupabaseConfigured } from './supabase-client.js';

let products = [
  { id: 'garmin-170', name: 'Ceas Garmin Forerunner 170 Music', brand: 'GARMIN', category: 'Ceasuri & GPS', price: 389.76, oldPrice: 487.20, image: 'public/products/garmin-170.webp', badge: '−20%', checkoutUrl: 'https://whop.com/ritm-sport/ceas-garmin-forerunner-170-music/' },
  { id: 'hoka-skyward', name: 'Pantofi alergare damă Hoka Skyward X 2', brand: 'HOKA', category: 'Alergare', price: 262.53, oldPrice: 328.16, image: 'public/products/hoka-skyward.webp', badge: '−20%', checkoutUrl: 'https://whop.com/ritm-sport/pantofi-alergare-dama-hoka-skyward-x-2/' },
  { id: 'hoka-zinal', name: 'Pantofi alergare trail damă Hoka Zinal 3', brand: 'HOKA', category: 'Alergare', price: 136.60, oldPrice: 181.92, image: 'public/products/hoka-zinal.webp', badge: '−25%', checkoutUrl: 'https://whop.com/ritm-sport/pantofi-alergare-trail-dama-hoka-zinal-3/' },
  { id: 'shokz-opendots', name: 'Căști audio Shokz OpenDots One', brand: 'SHOKZ', category: 'Audio', price: 213.70, oldPrice: 229.85, image: 'public/products/shokz.webp', badge: '−7%', checkoutUrl: 'https://whop.com/ritm-sport/casti-audio-shokz-opendots-one/' },
  { id: 'oakley-sphaera', name: "Ochelari Oakley Sphaera Strike Giro d'Italia 2026", brand: 'OAKLEY', category: 'Ciclism', price: 207.93, oldPrice: 259.91, image: 'public/products/oakley-glasses.webp', badge: '−20%', checkoutUrl: 'https://whop.com/ritm-sport/ochelari-oakley-sphaera-strike-giro-ditalia-2026/' },
  { id: 'oakley-stelvio', name: 'Cască ciclism Oakley Velo Stelvio MIPS', brand: 'OAKLEY', category: 'Ciclism', price: 311.67, oldPrice: 366.67, image: 'public/products/oakley-helmet.webp', badge: '−15%', checkoutUrl: 'https://whop.com/ritm-sport/casca-ciclism-oakley-velo-stelvio-mips/' },
  { id: 'garmin-instinct', name: 'Ceas Garmin Instinct 3 Solar Tactical, 45 mm', brand: 'GARMIN', category: 'Ceasuri & GPS', price: 446.41, oldPrice: 496.51, image: 'public/products/garmin-instinct.webp', badge: '−10%', checkoutUrl: 'https://whop.com/ritm-sport/ceas-garmin-instinct-3-solar-tactical-45-mm/' },
  { id: 'garmin-970', name: 'Ceas Garmin Forerunner 970 AMOLED', brand: 'GARMIN', category: 'Ceasuri & GPS', price: 740.52, oldPrice: 823.75, image: 'public/products/garmin-970.webp', badge: '−10%', checkoutUrl: 'https://whop.com/ritm-sport/ceas-garmin-forerunner-970-amoled/' },
  { id: 'mizuno-alpha', name: 'Ghete fotbal Mizuno Alpha III Elite Mix SS 2026', brand: 'MIZUNO', category: 'Fotbal', price: 153.38, oldPrice: 255.56, image: 'public/products/mizuno-alpha.webp', badge: '−40%', checkoutUrl: 'https://whop.com/ritm-sport/ghete-fotbal-mizuno-alpha-iii-elite-mix-ss-2026/' },
  { id: 'asics-kayano', name: 'Pantofi alergare damă Asics Gel-Kayano 32 Sunny Sizzle', brand: 'ASICS', category: 'Alergare', price: 155.56, oldPrice: 222.22, image: 'public/products/asics-kayano.webp', badge: '−30%', checkoutUrl: 'https://whop.com/ritm-sport/pantofi-alergare-dama-asics-gel-kayano-32-sunny-sizzle/' },
  { id: 'oakley-jersey', name: 'Bluză ciclism bărbați Oakley Icon Training', brand: 'OAKLEY', category: 'Ciclism', price: 116.78, oldPrice: 145.98, image: 'public/products/oakley-jersey.webp', badge: '−20%', checkoutUrl: 'https://whop.com/ritm-sport/oakley-icon-training/' },
  { id: 'on-cloudmonster', name: 'Pantofi alergare damă ON Cloudmonster 3', brand: 'ON', category: 'Alergare', price: 166.67, oldPrice: 222.22, image: 'public/products/on-cloudmonster.webp', badge: '−25%', checkoutUrl: 'https://whop.com/ritm-sport/pantofi-alergare-dama-on-cloudmonster-3/' },
  { id: 'adidas-supernova', name: 'Pantofi alergare bărbați Adidas Supernova Rise 3', brand: 'ADIDAS', category: 'Alergare', price: 124.18, oldPrice: 163.40, image: 'public/products/adidas-supernova.webp', badge: '−24%', checkoutUrl: 'https://whop.com/ritm-sport/pantofi-alergare-barbati-adidas-supernova-rise-3/' },
  { id: 'puma-deviate', name: 'Pantofi Puma Deviate Nitro Elite 4 Showtime', brand: 'PUMA', category: 'Alergare', price: 190.63, oldPrice: 272.11, image: 'public/products/puma-deviate.webp', badge: '−30%', checkoutUrl: 'https://whop.com/ritm-sport/pantofi-puma-deviate-nitro-elite-4-showtime/' },
  { id: 'urban-flex', name: 'Pantofi sport Urban Flex negru-lime', brand: 'RITM', category: 'Alergare', price: 24.90, image: 'public/products/urban-flex.webp', badge: 'NOU', checkoutUrl: 'https://whop.com/ritm-sport/pantofi-sport-urban-flex-negru-lime/' },
  { id: 'aero-run', name: 'Pantofi alergare Aero Run gri-albastru', brand: 'RITM', category: 'Alergare', price: 27.90, image: 'public/products/aero-run.webp', badge: 'NOU', checkoutUrl: 'https://whop.com/ritm-sport/pantofi-alergare-aero-run-gri-albastru/' },
  { id: 'street-color', name: 'Pantofi sport Street Color bej-coral', brand: 'RITM', category: 'Alergare', price: 29.90, image: 'public/products/street-color.webp', badge: 'NOU', checkoutUrl: 'https://whop.com/ritm-sport/pantofi-sport-street-color-bej-coral/' }
];

const STORAGE_KEYS = {
  customer: 'ritm-sport-customer',
  orders: 'ritm-sport-orders'
};

const orderStatuses = ['Comandă plasată', 'Confirmată', 'În tranzit', 'Livrată'];

const grid = document.querySelector('#product-grid');
const search = document.querySelector('#search');
const count = document.querySelector('#result-count');
const emptyState = document.querySelector('#empty-state');
const resetButton = document.querySelector('#reset-filters');
const filterButtons = [...document.querySelectorAll('[data-category]')];
const pageOverlay = document.querySelector('#page-overlay');
const accountPanel = document.querySelector('#account-panel');
const accountButton = document.querySelector('#account-button');
const accountButtonLabel = document.querySelector('#account-button-label');
const accountContent = document.querySelector('#account-content');
const toast = document.querySelector('#toast');
const layers = [accountPanel];

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

let customer = isSupabaseConfigured ? null : loadJSON(STORAGE_KEYS.customer, null);
let orders = isSupabaseConfigured ? [] : loadJSON(STORAGE_KEYS.orders, []);
let accountOrders = [];
let supabaseClient = null;

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
        <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" loading="lazy" />
      </div>
      <div class="product-content">
        <div class="product-meta">
          <span>${escapeHTML(product.brand)}</span>
          <span>${escapeHTML(product.category)}</span>
        </div>
        <h2>${escapeHTML(product.name)}</h2>
        <div class="product-actions">
          <div class="price">
            <strong>${formatMoney(product.price)}</strong>
            ${product.oldPrice ? `<s>${formatMoney(product.oldPrice)}</s>` : ''}
          </div>
          ${product.checkoutUrl
            ? `<a class="buy-button" href="${escapeHTML(product.checkoutUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Cumpără ${escapeHTML(product.name)} prin Whop">Cumpără</a>`
            : '<span class="unavailable-label">Indisponibil</span>'}
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
  if (supabaseClient) return accountOrders;
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

function createOrderItem(productId, quantity = 1) {
  const product = products.find((entry) => entry.id === productId);
  return {
    productId,
    name: product?.name || productId,
    price: product?.price || 0,
    quantity
  };
}

function ensureDemoOrders() {
  if (!customer || customerOrders().length > 0) return;

  const demoOrders = [
    {
      id: createUniqueOrderCode(),
      createdAt: '2026-08-08T10:30:00.000Z',
      customerEmail: customer.email,
      items: [
        createOrderItem('garmin-170'),
        createOrderItem('on-cloudmonster')
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
        createOrderItem('asics-kayano')
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
  const delivered = order.statusKey ? order.statusKey === 'delivered' : statusIndex === orderStatuses.length - 1;
  const terminal = ['refunded', 'cancelled'].includes(order.statusKey);
  const statusLabel = order.statusLabel || orderStatuses[statusIndex];
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
          <span class="status-pill${delivered ? ' delivered' : ''}">${escapeHTML(statusLabel)}</span>
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
        <p class="delivery-note">${terminal
          ? escapeHTML(statusLabel)
          : delivered
            ? escapeHTML(order.expectedDelivery)
            : `Livrare estimată: <strong>${escapeHTML(order.expectedDelivery || 'în curs de confirmare')}</strong>`}</p>
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
  if (isSupabaseConfigured) {
    accountContent.innerHTML = `
      <div class="login-view">
        <h3>Contul tău RITM.</h3>
        <p>Autentifică-te pentru a vedea comenzile plătite prin Whop și starea livrării.</p>
        <form id="login-form" class="login-form">
          <label class="field">
            <span>Nume</span>
            <input name="name" type="text" autocomplete="name" placeholder="Necesar la crearea contului" />
          </label>
          <label class="field">
            <span>E-mail</span>
            <input name="email" type="email" autocomplete="email" required />
          </label>
          <label class="field">
            <span>Parolă</span>
            <input name="password" type="password" autocomplete="current-password" minlength="8" required />
          </label>
          <div class="auth-actions">
            <button class="primary-button" type="submit" name="action" value="login">Intră în cont</button>
            <button class="secondary-button" type="submit" name="action" value="signup">Creează cont</button>
          </div>
          <p id="auth-feedback" class="form-disclaimer" role="status">Datele de autentificare sunt gestionate securizat de Supabase.</p>
        </form>
      </div>`;

    document.querySelector('#login-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const action = event.submitter?.value || 'login';
      const email = normalizeEmail(formData.get('email'));
      const password = String(formData.get('password'));
      const name = String(formData.get('name')).trim();
      const feedback = document.querySelector('#auth-feedback');
      feedback.textContent = 'Se procesează…';

      if (!supabaseClient) {
        feedback.textContent = 'Conexiunea Supabase nu este disponibilă.';
        return;
      }

      if (action === 'signup') {
        if (!name) {
          feedback.textContent = 'Introdu numele pentru a crea un cont.';
          return;
        }
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } }
        });
        feedback.textContent = error
          ? 'Contul nu a putut fi creat. Verifică datele.'
          : data.session
            ? 'Cont creat. Ești autentificat.'
            : 'Verifică e-mailul și confirmă adresa pentru a activa contul.';
        return;
      }

      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      feedback.textContent = error ? 'E-mail sau parolă incorectă.' : 'Autentificare reușită.';
    });
    return;
  }

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

  document.querySelector('#logout-button').addEventListener('click', async () => {
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
      return;
    }
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

function mapDatabaseProduct(product) {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    price: Number(product.price),
    oldPrice: product.old_price === null ? null : Number(product.old_price),
    image: product.image,
    badge: product.badge,
    checkoutUrl: product.checkout_url
  };
}

const databaseStatus = {
  paid: { index: 0, label: 'Comandă plătită' },
  processing: { index: 1, label: 'În procesare' },
  shipped: { index: 2, label: 'În tranzit' },
  delivered: { index: 3, label: 'Livrată' },
  refunded: { index: 0, label: 'Rambursată' },
  cancelled: { index: 0, label: 'Anulată' }
};

function mapDatabaseOrder(order) {
  const state = databaseStatus[order.status] || databaseStatus.paid;
  const expectedDelivery = order.tracking_number
    ? `AWB: ${order.tracking_number}`
    : order.expected_delivery
      ? new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${order.expected_delivery}T12:00:00`))
      : 'în curs de confirmare';

  return {
    id: order.order_number,
    createdAt: order.created_at,
    customerEmail: order.customer_email,
    items: Array.isArray(order.items) ? order.items : [],
    subtotal: Number(order.subtotal),
    shipping: 0,
    total: Number(order.total),
    statusIndex: state.index,
    statusKey: order.status,
    statusLabel: state.label,
    expectedDelivery
  };
}

async function loadSupabaseProducts() {
  const { data, error } = await supabaseClient
    .from('products')
    .select('id,name,brand,category,price,old_price,image,badge,checkout_url')
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (error || !data?.length) return;
  products = data.map(mapDatabaseProduct);
  renderProducts();
}

async function applySupabaseSession(session) {
  if (!session?.user) {
    customer = null;
    accountOrders = [];
    updateAccountButton();
    renderAccount();
    return;
  }

  const [{ data: profile }, { data: databaseOrders, error: ordersError }] = await Promise.all([
    supabaseClient.from('profiles').select('full_name').eq('id', session.user.id).maybeSingle(),
    supabaseClient.from('orders').select('*').order('created_at', { ascending: false })
  ]);

  customer = {
    name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Client',
    email: session.user.email || ''
  };
  accountOrders = ordersError ? [] : (databaseOrders || []).map(mapDatabaseOrder);
  updateAccountButton();
  renderAccount();
}

async function initializeSupabase() {
  if (!isSupabaseConfigured) return;

  try {
    supabaseClient = await getSupabaseClient();
    await loadSupabaseProducts();
    const { data: { session } } = await supabaseClient.auth.getSession();
    await applySupabaseSession(session);
    supabaseClient.auth.onAuthStateChange((_event, nextSession) => {
      window.setTimeout(() => applySupabaseSession(nextSession), 0);
    });
  } catch (error) {
    console.error('Supabase initialization failed', error);
    showToast('Conexiunea cu baza de date nu este disponibilă. Catalogul local rămâne activ.');
  }
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

accountButton.addEventListener('click', () => {
  renderAccount();
  showLayer(accountPanel);
});

pageOverlay.addEventListener('click', closeLayers);

document.querySelectorAll('[data-close-layer]').forEach((button) => {
  button.addEventListener('click', closeLayers);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !pageOverlay.hidden) closeLayers();
});

renderProducts();
renderAccount();
updateAccountButton();
initializeSupabase();

if (window.location.hash === '#account') {
  showLayer(accountPanel);
}
