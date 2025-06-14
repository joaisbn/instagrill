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
    // Fallback para caso o arquivo não carregue
    menuContainer.innerHTML = `
      <div class="error-message">
        <p>Não foi possível carregar o cardápio no momento.</p>
        <p>Por favor, tente novamente mais tarde ou entre em contato conosco.</p>
      </div>
    `;
  }
}

// Renderizar categorias no menu
function renderCategories() {
  // Limpa o menu de categorias
  categoriesMenu.innerHTML = "";

  // Adiciona botão "Todos"
  const allButton = document.createElement("button");
  allButton.className = "categoria-botao active";
  allButton.textContent = "Todos";
  allButton.addEventListener("click", renderAllItems);
  categoriesMenu.appendChild(allButton);

  // Adiciona as categorias do JSON
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
      <h2 class="secao-titulo">${category.icone}${category.nome}</h2>
      <div class="secao-categoria" id="items-${category.id}"></div>
    `;
    menuContainer.appendChild(section);

    renderItems(category.itens, `items-${category.id}`);
  });

  // Atualiza botão ativo
  updateActiveButton("Todos");
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
    <h2 class="secao-titulo">${category.nome}</h2>
    <div class="secao-categoria" id="items-${category.id}"></div>
  `;
  menuContainer.appendChild(section);

  renderItems(category.itens, `items-${category.id}`);

  // Atualiza botão ativo
  updateActiveButton(category.nome);
}

// Atualizar botão ativo no menu de categorias
function updateActiveButton(activeCategoryName) {
  document.querySelectorAll(".categoria-botao").forEach((button) => {
    button.classList.toggle(
      "active",
      button.textContent === activeCategoryName
    );
  });
}

// Renderizar lista de itens
function renderItems(items, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  items.forEach((item) => {
    const itemElement = document.createElement("article");
    itemElement.className = "secao-item";
    itemElement.innerHTML = `
      <img src="${item.img || ""}" alt="${
      item.nome
    }" class="item-image">
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

  // Adiciona eventos aos novos botões
  addCartEventListeners();
}

// Adicionar eventos aos botões "Adicionar ao Carrinho"
function addCartEventListeners() {
  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", (e) => {
      const itemElement = e.target.closest(".secao-item");
      const name = itemElement.querySelector(".item-nome").textContent;
      const priceText = itemElement.querySelector(".item-preco").textContent;
      const price = parseFloat(
        priceText.replace("R$", "").replace(",", ".").trim()
      );

      addItemToCart(name, price);

      // Efeito de animação no botão
      const originalText = button.textContent;
      button.textContent = "✓ Adicionado";
      button.style.backgroundColor = "var(--accepted-color)";

      setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = "";
      }, 2000);
    });
  });
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
}

function decreaseItem(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity -= 1;
  } else {
    cart.splice(index, 1);
  }

  updateCartModal();
  updateCartCount();
}

function increaseItem(index) {
  cart[index].quantity += 1;
  updateCartModal();
  updateCartCount();
}

function removeItem(index) {
  cart.splice(index, 1);
  updateCartModal();
  updateCartCount();
}

function updateCartCount() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  cartCount.textContent = count;
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

  // Adiciona eventos aos novos botões
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

// Finalizar pedido
checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) return;

  checkoutBtn.textContent = "Processando...";
  checkoutBtn.classList.add("loading");

  // Simula o processamento
  setTimeout(() => {
    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const itemsText = cart
      .map(
        (item) =>
          `${item.name} (${item.quantity}x) - R$ ${(
            item.price * item.quantity
          ).toFixed(2)}`
      )
      .join("\n");

    const message = `Olá, gostaria de fazer o seguinte pedido:\n\n${itemsText}\n\nTotal: R$ ${total.toFixed(
      2
    )}`;
    const whatsappUrl = `https://wa.me/21999999999?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank");
    cart = [];
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

  // Configuração do carrinho
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
});
