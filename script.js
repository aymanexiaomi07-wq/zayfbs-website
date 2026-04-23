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
showToast(`${p.name} ajouté au panier 🛒`, 'green');
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
