const DEFAULT_PRODUCTS = [
  { id: 1, name: "olive oil", price: 66680, image: "img/6.jpg" },
  { id: 2, name: "olive oil2", price: 980, image: "img/7.jpg" },
  { id: 3, name: "olive oil3", price: 830, image: "img/8.jpg" },
  { id: 4, name: "olive oil4", price: 850, image: "img/9.jpg" },
  { id: 5, name: "olive oil5", price: 8760, image: "img/10.jpg" },
];

function getProducts() {
  const stored = localStorage.clear()
  return stored ? JSON.parse(stored) : DEFAULT_PRODUCTS;
}

function saveProducts(products) {
  localStorage.setItem('zayfbs_products', JSON.stringify(products));
}

function getCart() {
  const stored = localStorage.getItem('zayfbs_cart');
  return stored ? JSON.parse(stored) : [];
}

function saveCart(cart) {
  localStorage.setItem('zayfbs_cart', JSON.stringify(cart));
}

function getNextId() {
  const n = parseInt(localStorage.getItem('zayfbs_nextid') || '6');
  localStorage.setItem('zayfbs_nextid', n + 1);
  return n;
}

// ===== CART BADGE =====
function updateCartBadge() {
  const cart = getCart();
  const total = cart.reduce((s, c) => s + c.qty, 0);
  const badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = total;
}

// ===== CART MODAL =====
function openCart() {
  renderCart();
  document.getElementById('cartOverlay').classList.add('open');
}

function closeCart() {
  document.getElementById('cartOverlay').classList.remove('open');
}

function renderCart() {
  const cart = getCart();
  const container = document.getElementById('cartItems');
  if (!container) return;
  if (cart.length === 0) {
    container.innerHTML = '<div class="cart-empty">Votre panier est vide.</div>';
    document.getElementById('cartTotal').textContent = '0 dh';
    return;
  }
  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${item.price} DH</div>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${item.id}, +1)">+</button>
      </div>
    </div>
  `).join('');
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  document.getElementById('cartTotal').textContent = total + ' dh';
}

function changeQty(id, delta) {
  let cart = getCart();
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(c => c.id !== id);
  saveCart(cart);
  updateCartBadge();
  renderCart();
}

function addToCart(id) {
  const products = getProducts();
  const p = products.find(x => x.id === id);
  if (!p) return;
  let cart = getCart();
  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...p, qty: 1 });
  }
  saveCart(cart);
  updateCartBadge();
  showToast(`"${p.name}" ajouté au panier 🛒`, 'green');
}

function commander() {
  const cart = getCart();
  if (cart.length === 0) {
    showToast('Votre panier est vide.', 'red');
    return;
  }
  saveCart([]);
  updateCartBadge();
  closeCart();
  showToast('Commande passée avec succès ! Merci ', 'green');
}

// ===== PRODUCT MODAL (Add/Edit) =====
let editingId = null;

function openProductModal(id = null) {
  editingId = id;
  const overlay = document.getElementById('productModalOverlay');
  if (!overlay) return;
  const title = document.getElementById('productModalTitle');
  if (id) {
    const products = getProducts();
    const p = products.find(x => x.id === id);
    title.textContent = 'Modifier le produit';
    document.getElementById('pName').value = p.name;
    document.getElementById('pPrice').value = p.price;
    document.getElementById('pImage').value = p.image;
  } else {
    title.textContent = 'Ajouter un produit';
    document.getElementById('pName').value = '';
    document.getElementById('pPrice').value = '';
    document.getElementById('pImage').value = '';
  }
  overlay.classList.add('open');
}

function closeProductModal() {
  const overlay = document.getElementById('productModalOverlay');
  if (overlay) overlay.classList.remove('open');
  editingId = null;
}

function saveProduct() {
  const name = document.getElementById('pName').value.trim();
  const price = parseInt(document.getElementById('pPrice').value);
  const image = document.getElementById('pImage').value.trim() ||
    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop';

  if (!name || !price || price <= 0) {
    showToast('Veuillez remplir tous les champs.', 'red');
    return;
  }

  let products = getProducts();
  if (editingId) {
    const idx = products.findIndex(x => x.id === editingId);
    products[idx] = { ...products[idx], name, price, image };
    showToast('Produit modifié ✓', 'green');
  } else {
    products.push({ id: getNextId(), name, price, image });
    showToast('Produit ajouté ✓', 'green');
  }
  saveProducts(products);
  closeProductModal();
  if (typeof renderProducts === 'function') renderProducts();
}

// ===== CONFIRM DELETE =====
let deletingId = null;

function openConfirm(id) {
  deletingId = id;
  document.getElementById('confirmOverlay').classList.add('open');
}

function closeConfirm() {
  document.getElementById('confirmOverlay').classList.remove('open');
  deletingId = null;
}

function confirmDelete() {
  let products = getProducts();
  products = products.filter(p => p.id !== deletingId);
  saveProducts(products);
  let cart = getCart();
  cart = cart.filter(c => c.id !== deletingId);
  saveCart(cart);
  closeConfirm();
  updateCartBadge();
  showToast('Produit supprimé.', 'red');
  if (typeof renderProducts === 'function') renderProducts();
}

// ===== CONTACT =====
function submitContact(e) {
  e.preventDefault();
  const name = document.getElementById('contactName').value.trim();
  showToast(`Message envoyé, merci ${name} !`, 'green');
  e.target.reset();
}

// ===== TOAST =====
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast show' + (type ? ' ' + type : '');
  setTimeout(() => t.className = 'toast', 3000);
}

// ===== CLOSE MODALS ON OVERLAY CLICK =====
document.addEventListener('DOMContentLoaded', function () {
  updateCartBadge();

  const cartOverlay = document.getElementById('cartOverlay');
  if (cartOverlay) cartOverlay.addEventListener('click', e => { if (e.target === cartOverlay) closeCart(); });

  const productModalOverlay = document.getElementById('productModalOverlay');
  if (productModalOverlay) productModalOverlay.addEventListener('click', e => { if (e.target === productModalOverlay) closeProductModal(); });

  const confirmOverlay = document.getElementById('confirmOverlay');
  if (confirmOverlay) confirmOverlay.addEventListener('click', e => { if (e.target === confirmOverlay) closeConfirm(); });
});