let cart = [];
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotalPrice = document.getElementById("cart-total-price");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.querySelector(".close-modal"); // Corrigido aqui

// Contador de itens no carrinho
const addButtons = document.querySelectorAll(".add-to-cart");
const cartCount = document.getElementById("cart-count"); // Alterado para pegar pelo ID

// Abrir e fechar o carrinho
document.getElementById("cart").addEventListener("click", () => {
  updateCartModal();
  cartModal.style.display = "block";
});

// Corrigido o fechamento do modal
closeModalBtn.addEventListener("click", () => {
  cartModal.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === cartModal) {
    cartModal.style.display = "none";
  }
});

// Função para atualizar o modal do carrinho
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
  cartCount.textContent = count; // Usando a referência já capturada
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
          `${item.name} (${item.quantity}x) - R$ ${(item.price * item.quantity).toFixed(2)}`
      )
      .join("\n");

    const message = `Olá, gostaria de fazer o seguinte pedido:\n\n${itemsText}\n\nTotal: R$ ${total.toFixed(2)}`;
    const whatsappUrl = `https://wa.me/21999999999?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
    cart = [];
    updateCartModal();
    updateCartCount();

    checkoutBtn.textContent = "Finalizar Pedido";
    checkoutBtn.classList.remove("loading");
    cartModal.style.display = "none"; // Fechar o modal após finalizar
  }, 1500);
});

// Adicionar itens ao carrinho - CORREÇÃO PRINCIPAL
addButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    const item = e.target.closest(".secao-item");
    const name = item.querySelector(".item-nome").textContent;
    const priceText = item.querySelector(".item-preco").textContent;
    const price = parseFloat(priceText.replace("R$", "").replace(",", ".").trim());

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