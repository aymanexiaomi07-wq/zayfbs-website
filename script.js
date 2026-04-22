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