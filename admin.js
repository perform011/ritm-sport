import { getSupabaseClient, isSupabaseConfigured } from './supabase-client.js';

const setupView = document.querySelector('#admin-setup');
const loginView = document.querySelector('#admin-login');
const deniedView = document.querySelector('#admin-denied');
const dashboard = document.querySelector('#admin-dashboard');
const logoutButton = document.querySelector('#admin-logout');
const loginForm = document.querySelector('#admin-login-form');
const loginError = document.querySelector('#admin-login-error');
const feedback = document.querySelector('#admin-feedback');
const ordersBody = document.querySelector('#orders-table-body');
const productsBody = document.querySelector('#products-table-body');
const ordersEmpty = document.querySelector('#orders-empty');

let supabase;
let orders = [];
let products = [];

function escapeHTML(value = '') {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);
}

function money(value, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: String(currency || 'usd').toUpperCase()
  }).format(Number(value) || 0);
}

function renderDeliveryDetails(order) {
  const address = order.shipping_address && typeof order.shipping_address === 'object'
    ? order.shipping_address
    : {};
  const addressText = [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postal_code || address.postalCode,
    address.country
  ].filter(Boolean).join(', ');
  const responses = Array.isArray(order.custom_fields?.responses)
    ? order.custom_fields.responses
    : [];
  const lines = [
    order.customer_phone ? `Telefon: ${order.customer_phone}` : '',
    addressText ? `Adresă: ${addressText}` : '',
    ...responses.map((item) => `${item.question || 'Detaliu'}: ${item.answer || '—'}`)
  ].filter(Boolean);

  if (!lines.length) return '<span>—</span>';
  return `<details class="admin-details">
    <summary>Vezi</summary>
    ${lines.map((line) => `<small>${escapeHTML(line)}</small>`).join('')}
  </details>`;
}

function showOnly(view) {
  [setupView, loginView, deniedView, dashboard].forEach((item) => {
    item.hidden = item !== view;
  });
  logoutButton.hidden = view !== dashboard && view !== deniedView;
}

function setFeedback(message, isError = false) {
  feedback.textContent = message;
  feedback.classList.toggle('error', isError);
}

function renderOrders() {
  ordersEmpty.hidden = orders.length > 0;
  ordersBody.innerHTML = orders.map((order) => {
    const firstItem = Array.isArray(order.items) ? order.items[0] : null;
    return `
      <tr data-order-id="${escapeHTML(order.id)}">
        <td><strong>${escapeHTML(order.order_number)}</strong><small>${new Date(order.created_at).toLocaleDateString('ro-RO')}</small></td>
        <td><strong>${escapeHTML(order.customer_name || '—')}</strong><small>${escapeHTML(order.customer_email)}</small></td>
        <td>${escapeHTML(firstItem?.name || 'Produs Whop')}</td>
        <td>${money(order.total, order.currency)}</td>
        <td>${renderDeliveryDetails(order)}</td>
        <td>
          <select data-order-status>
            ${['paid', 'processing', 'shipped', 'delivered', 'refunded', 'cancelled'].map((status) =>
              `<option value="${status}"${order.status === status ? ' selected' : ''}>${status}</option>`
            ).join('')}
          </select>
        </td>
        <td><input data-order-tracking type="text" value="${escapeHTML(order.tracking_number || '')}" placeholder="AWB" /></td>
        <td><button class="secondary-button admin-save" data-save-order type="button">Salvează</button></td>
      </tr>`;
  }).join('');
}

function renderProducts() {
  productsBody.innerHTML = products.map((product) => `
    <tr data-product-id="${escapeHTML(product.id)}">
      <td><strong>${escapeHTML(product.name)}</strong><small>${escapeHTML(product.brand)}</small></td>
      <td>${escapeHTML(product.category)}</td>
      <td><input data-product-price type="number" min="0" step="0.01" value="${Number(product.price).toFixed(2)}" /></td>
      <td><input data-product-active type="checkbox"${product.active ? ' checked' : ''} aria-label="Produs activ" /></td>
      <td><a href="${escapeHTML(product.checkout_url)}" target="_blank" rel="noopener noreferrer">Deschide</a></td>
      <td><button class="secondary-button admin-save" data-save-product type="button">Salvează</button></td>
    </tr>`).join('');
}

function renderStats() {
  document.querySelector('#stat-orders').textContent = orders.length;
  document.querySelector('#stat-processing').textContent = orders.filter((order) => ['paid', 'processing'].includes(order.status)).length;
  document.querySelector('#stat-products').textContent = products.filter((product) => product.active).length;
  document.querySelector('#stat-revenue').textContent = money(
    orders.filter((order) => !['refunded', 'cancelled'].includes(order.status)).reduce((sum, order) => sum + Number(order.total || 0), 0)
  );
}

async function loadDashboard() {
  setFeedback('Se actualizează…');
  const [ordersResult, productsResult] = await Promise.all([
    supabase.from('orders').select('*').order('created_at', { ascending: false }),
    supabase.from('products').select('*').order('sort_order', { ascending: true })
  ]);

  if (ordersResult.error || productsResult.error) {
    setFeedback(ordersResult.error?.message || productsResult.error?.message || 'Eroare la încărcare.', true);
    return;
  }

  orders = ordersResult.data || [];
  products = productsResult.data || [];
  renderOrders();
  renderProducts();
  renderStats();
  setFeedback(`Actualizat la ${new Date().toLocaleTimeString('ro-RO')}.`);
}

async function routeSession(session) {
  if (!session?.user) {
    showOnly(loginView);
    return;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (error || profile?.role !== 'admin') {
    showOnly(deniedView);
    return;
  }

  showOnly(dashboard);
  await loadDashboard();
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginError.textContent = '';
  const form = new FormData(event.currentTarget);
  const { error } = await supabase.auth.signInWithPassword({
    email: String(form.get('email')).trim(),
    password: String(form.get('password'))
  });
  if (error) loginError.textContent = 'Autentificare nereușită. Verifică datele.';
});

logoutButton.addEventListener('click', () => supabase.auth.signOut());
document.querySelector('#admin-refresh').addEventListener('click', loadDashboard);

ordersBody.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-save-order]');
  if (!button) return;
  const row = button.closest('[data-order-id]');
  button.disabled = true;
  const { error } = await supabase.from('orders').update({
    status: row.querySelector('[data-order-status]').value,
    tracking_number: row.querySelector('[data-order-tracking]').value.trim() || null
  }).eq('id', row.dataset.orderId);
  button.disabled = false;
  setFeedback(error ? error.message : 'Comanda a fost actualizată.', Boolean(error));
  if (!error) await loadDashboard();
});

productsBody.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-save-product]');
  if (!button) return;
  const row = button.closest('[data-product-id]');
  button.disabled = true;
  const { error } = await supabase.from('products').update({
    price: Number(row.querySelector('[data-product-price]').value),
    active: row.querySelector('[data-product-active]').checked
  }).eq('id', row.dataset.productId);
  button.disabled = false;
  setFeedback(error ? error.message : 'Produsul a fost actualizat pe site.', Boolean(error));
  if (!error) await loadDashboard();
});

async function start() {
  if (!isSupabaseConfigured) {
    showOnly(setupView);
    return;
  }

  try {
    supabase = await getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    await routeSession(session);
    supabase.auth.onAuthStateChange((_event, nextSession) => {
      window.setTimeout(() => routeSession(nextSession), 0);
    });
  } catch (error) {
    setupView.querySelector('p').textContent = 'Conexiunea Supabase nu a putut fi inițializată. Verifică URL-ul și cheia publicabilă.';
    showOnly(setupView);
  }
}

start();
