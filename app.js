const WHATSAPP_NUMBER = "5555984282909";
const products = [
  { id: "flor-solar", name: "Flor solar", category: "natureza", description: "Resina e detalhes dourados", price: 38, badge: "feito à mão", image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=700&q=80" },
  { id: "gatinha", name: "Gatinha curiosa", category: "fofuras", description: "Um charme para levar junto", price: 32, badge: "queridinho", image: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=700&q=80" },
  { id: "ceu-aberto", name: "Céu aberto", category: "abstratos", description: "Azul, brilho e movimento", price: 42, badge: "peça única", image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=700&q=80" },
  { id: "folhinha", name: "Folhinha", category: "natureza", description: "Um pedacinho de jardim", price: 35, badge: "feito à mão", image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=700&q=80" },
  { id: "morango", name: "Morango doce", category: "fofuras", description: "Pequeno, alegre e colorido", price: 29, badge: "novidade", image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=700&q=80" },
  { id: "sol-lunar", name: "Sol & lua", category: "abstratos", description: "Para os dias de céu inteiro", price: 45, badge: "peça única", image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=700&q=80" }
];
const cart = new Map();
const money = value => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
const grid = document.querySelector("#product-grid");
const bagDialog = document.querySelector("#bag-dialog");
let toastTimer;

function renderProducts(category = "todos") {
  const visible = category === "todos" ? products : products.filter(product => product.category === category);
  grid.innerHTML = visible.map(product => `
    <article class="product-card">
      <div class="product-art"><img src="${product.image}" alt="${product.name}" loading="lazy"><span class="product-label">${product.badge}</span><button class="add-button" data-add="${product.id}" aria-label="Adicionar ${product.name} à sacolinha">+</button></div>
      <div class="product-meta"><div><h3>${product.name}</h3><p>${product.description}</p></div><span class="product-price">${money(product.price)}</span></div>
    </article>`).join("");
}
function renderCart() {
  const entries = [...cart.entries()];
  const count = entries.reduce((sum, [, quantity]) => sum + quantity, 0);
  const total = entries.reduce((sum, [id, quantity]) => sum + products.find(product => product.id === id).price * quantity, 0);
  document.querySelector("#bag-count").textContent = count;
  document.querySelector("#bag-button").setAttribute("aria-label", `Ver sacolinha, ${count} ${count === 1 ? "item" : "itens"}`);
  document.querySelector("#bag-items").innerHTML = entries.length ? entries.map(([id, quantity]) => {
    const product = products.find(item => item.id === id);
    return `<div class="bag-row"><img src="${product.image}" alt=""><div><h3>${product.name}</h3><p>${quantity} × ${money(product.price)}</p></div><button data-remove="${id}" aria-label="Remover ${product.name}">remover</button></div>`;
  }).join("") : '<p class="bag-empty">Sua sacolinha ainda está vazia.<br>Tem tanta coisa bonita esperando por você ✳</p>';
  document.querySelector("#bag-total").textContent = money(total);
}
function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}
document.querySelector(".filters").addEventListener("click", event => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  document.querySelectorAll(".filter").forEach(filter => filter.classList.toggle("active", filter === button));
  renderProducts(button.dataset.filter);
});
grid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  const id = button.dataset.add;
  cart.set(id, (cart.get(id) || 0) + 1);
  renderCart();
  showToast(`${products.find(product => product.id === id).name} foi para a sacolinha ✳`);
});
function openCart() {
  renderCart();
  // Keep the drawer usable in browsers that do not implement the native dialog API.
  if (typeof bagDialog.showModal === "function") bagDialog.showModal();
  else bagDialog.setAttribute("open", "");
}
function closeCart() {
  if (typeof bagDialog.close === "function" && bagDialog.open) bagDialog.close();
  else bagDialog.removeAttribute("open");
}
document.querySelector("#bag-button").addEventListener("click", openCart);
document.querySelector("#close-dialog").addEventListener("click", closeCart);
bagDialog.addEventListener("click", event => { if (event.target === bagDialog) closeCart(); });
document.querySelector("#bag-items").addEventListener("click", event => {
  const button = event.target.closest("[data-remove]");
  if (!button) return;
  cart.delete(button.dataset.remove);
  renderCart();
});
document.querySelector("#checkout").addEventListener("click", () => {
  if (!cart.size) { showToast("Sua sacolinha ainda está vazia ✳"); return; }
  const lines = [...cart.entries()].map(([id, quantity]) => {
    const product = products.find(item => item.id === id);
    return `• ${quantity}x ${product.name} — ${money(quantity * product.price)}`;
  });
  const total = [...cart.entries()].reduce((sum, [id, quantity]) => sum + products.find(product => product.id === id).price * quantity, 0);
  const message = `Oi! Vim pela loja Criativa Store e gostaria de pedir:\n${lines.join("\n")}\n\nTotal: ${money(total)}\n\nPodemos combinar a entrega?`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
});
document.querySelector("#year").textContent = new Date().getFullYear();
renderProducts();
renderCart();
