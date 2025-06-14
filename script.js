// Variáveis globais
let cart = [];
let menuData = [];

// Elementos do DOM
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotalPrice = document.getElementById("cart-total-price");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.querySelector(".close-modal");
const categoriesMenu = document.querySelector(".categorias-menu");
const menuContainer = document.querySelector("main");
const cartCount = document.getElementById("cart-count");

// Carregar dados do menu
async function loadMenuData() {
  try {
    const response = await fetch("data.json");
    if (!response.ok) {
      throw new Error("Erro ao carregar dados do menu");
    }
    menuData = await response.json();
    renderCategories();
    renderAllItems();
  } catch (error) {
    console.error("Erro:", error);
    showErrorMessage();
  }
}

function showErrorMessage() {
  menuContainer.innerHTML = `
    <div class="error-message">
      <p>Não foi possível carregar o cardápio no momento.</p>
      <p>Por favor, tente novamente mais tarde ou entre em contato conosco.</p>
    </div>
  `;
}

// Renderizar categorias no menu
function renderCategories() {
  categoriesMenu.innerHTML = "";

  // Botão "Todos"
  const allButton = document.createElement("button");
  allButton.className = "categoria-botao active";
  allButton.textContent = "Todos";
  allButton.addEventListener("click", renderAllItems);
  categoriesMenu.appendChild(allButton);

  // Demais categorias
  menuData.categorias.forEach((category) => {
    const button = document.createElement("button");
    button.className = "categoria-botao";
    button.textContent = category.nome;
    button.addEventListener("click", () => renderCategoryItems(category.id));
    categoriesMenu.appendChild(button);
  });
}

// Renderizar todos os itens
function renderAllItems() {
  menuContainer.innerHTML = "";

  menuData.categorias.forEach((category) => {
    const section = document.createElement("section");
    section.className = "secao-menu";
    section.id = `category-${category.id}`;
    section.innerHTML = `
      <h2 class="secao-titulo">${category.icone} ${category.nome}</h2>
      <div class="secao-categoria"></div>
    `;
    menuContainer.appendChild(section);
    renderItems(category.itens, section.querySelector(".secao-categoria"));
  });

  updateActiveButton("Todos");
  setupCartEventDelegation();
}

// Renderizar itens de uma categoria específica
function renderCategoryItems(categoryId) {
  menuContainer.innerHTML = "";

  const category = menuData.categorias.find((c) => c.id === categoryId);
  if (!category) return;

  const section = document.createElement("section");
  section.className = "secao-menu";
  section.id = `category-${category.id}`;
  section.innerHTML = `
    <h2 class="secao-titulo">${category.icone} ${category.nome}</h2>
    <div class="secao-categoria"></div>
  `;
  menuContainer.appendChild(section);
  renderItems(category.itens, section.querySelector(".secao-categoria"));

  updateActiveButton(category.nome);
  setupCartEventDelegation();
}

// Atualizar botão ativo
function updateActiveButton(activeCategoryName) {
  document.querySelectorAll(".categoria-botao").forEach((button) => {
    button.classList.toggle(
      "active",
      button.textContent === activeCategoryName
    );
  });
}

// Renderizar lista de itens
function renderItems(items, container) {
  container.innerHTML = "";

  items.forEach((item) => {
    const itemElement = document.createElement("article");
    itemElement.className = "secao-item";
    itemElement.dataset.itemId = item.id;
    itemElement.innerHTML = `
      <img src="${item.img || ""}" alt="${item.nome}" class="item-image">
      <div class="item-info">
        <h3 class="item-nome">${item.nome}</h3>
        <p class="item-descricao">${item.descricao}</p>
        <div class="item-preco">R$ ${item.preco
          .toFixed(2)
          .replace(".", ",")}</div>
        <button class="add-to-cart">Adicionar ao Carrinho</button>
      </div>
    `;
    container.appendChild(itemElement);
  });
}

// Configuração da delegação de eventos
function setupCartEventDelegation() {
  // Remove event listeners antigos
  document.querySelectorAll(".secao-categoria").forEach((container) => {
    container.replaceWith(container.cloneNode(true));
  });

  // Adiciona delegação de eventos
  document.querySelectorAll(".secao-categoria").forEach((container) => {
    container.addEventListener("click", (e) => {
      if (e.target.classList.contains("add-to-cart")) {
        handleAddToCart(e);
      }
    });
  });
}

// Função para adicionar ao carrinho
function handleAddToCart(e) {
  const button = e.target;
  const itemElement = button.closest(".secao-item");
  const name = itemElement.querySelector(".item-nome").textContent;
  const priceText = itemElement.querySelector(".item-preco").textContent;
  const price = parseFloat(
    priceText.replace("R$", "").replace(",", ".").trim()
  );

  addItemToCart(name, price);

  // Efeito visual
  const originalText = button.textContent;
  button.textContent = "✓ Adicionado";
  button.style.backgroundColor = "var(--accepted-color)";

  setTimeout(() => {
    button.textContent = originalText;
    button.style.backgroundColor = "";
  }, 2000);
}

// Funções do carrinho
function addItemToCart(name, price) {
  const existingItem = cart.find((item) => item.name === name);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      name,
      price: parseFloat(price),
      quantity: 1,
    });
  }

  updateCartCount();
  saveCartToLocalStorage(); // Salva o carrinho no localStorage
}

function updateCartCount() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  cartCount.textContent = count;
}

// Função para salvar o carrinho no localStorage
function saveCartToLocalStorage() {
  localStorage.setItem("instagrillCart", JSON.stringify(cart));
}

// Função para carregar o carrinho do localStorage
function loadCartFromLocalStorage() {
  const savedCart = localStorage.getItem("instagrillCart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartCount();
  }
}

function updateCartModal() {
  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p>Seu carrinho está vazio</p>";
    cartTotalPrice.textContent = "0,00";
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {
    const itemElement = document.createElement("div");
    itemElement.className = "cart-item";
    itemElement.innerHTML = `
      <div>
        <h4>${item.name}</h4>
        <p>R$ ${item.price.toFixed(2).replace(".", ",")}</p>
      </div>
      <div class="cart-item-controls">
        <button class="decrease-item" data-index="${index}">-</button>
        <span>${item.quantity}</span>
        <button class="increase-item" data-index="${index}">+</button>
        <button class="remove-item" data-index="${index}">×</button>
      </div>
    `;
    cartItemsContainer.appendChild(itemElement);
    total += item.price * item.quantity;
  });

  cartTotalPrice.textContent = total.toFixed(2).replace(".", ",");

  // Adiciona eventos aos controles do carrinho
  setupCartControls();
}

function setupCartControls() {
  document.querySelectorAll(".decrease-item").forEach((button) => {
    button.addEventListener("click", (e) => {
      const index = e.target.getAttribute("data-index");
      decreaseItem(index);
    });
  });

  document.querySelectorAll(".increase-item").forEach((button) => {
    button.addEventListener("click", (e) => {
      const index = e.target.getAttribute("data-index");
      increaseItem(index);
    });
  });

  document.querySelectorAll(".remove-item").forEach((button) => {
    button.addEventListener("click", (e) => {
      const index = e.target.getAttribute("data-index");
      removeItem(index);
    });
  });
}

function decreaseItem(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity -= 1;
  } else {
    cart.splice(index, 1);
  }
  updateCartModal();
  updateCartCount();
  saveCartToLocalStorage();
}

function increaseItem(index) {
  cart[index].quantity += 1;
  updateCartModal();
  updateCartCount();
  saveCartToLocalStorage();
}

function removeItem(index) {
  cart.splice(index, 1);
  updateCartModal();
  updateCartCount();
  saveCartToLocalStorage();
}

// Finalizar pedido
checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) return;

  checkoutBtn.textContent = "Processando...";
  checkoutBtn.classList.add("loading");

  setTimeout(() => {
    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const itemsText = cart
      .map(
        (item) =>
          `- ${item.name} (${item.quantity}x): R$ ${(
            item.price * item.quantity
          ).toFixed(2)}`
      )
      .join("\n");

    const message = `Olá, gostaria de fazer o seguinte pedido:\n\n${itemsText}\n\n*Total: R$ ${total.toFixed(
      2
    )}*`;
    const whatsappUrl = `https://wa.me/5521964456892?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank");
    cart = [];
    localStorage.removeItem("instagrillCart"); // Limpa o localStorage
    updateCartModal();
    updateCartCount();
    checkoutBtn.textContent = "Finalizar Pedido";
    checkoutBtn.classList.remove("loading");
    cartModal.style.display = "none";
  }, 1500);
});

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  loadMenuData();
  loadCartFromLocalStorage(); // Carrega o carrinho do localStorage

  document.getElementById("cart").addEventListener("click", () => {
    updateCartModal();
    cartModal.style.display = "block";
  });

  closeModalBtn.addEventListener("click", () => {
    cartModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === cartModal) {
      cartModal.style.display = "none";
    }
  });

  updateCartModal(); // Atualiza o modal com os itens carregados
});
