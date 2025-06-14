// Contador de itens no carrinho
const addButtons = document.querySelectorAll(".add-to-cart");
const cartCount = document.querySelector(".cart-item-count");
let count = 0;

addButtons.forEach((button) => {
  button.addEventListener("click", () => {
    count++;
    cartCount.textContent = count;

    // Efeito de animação no botão
    button.textContent = "Adicionado ✓";
    button.style.backgroundColor = "var(--accepted-color)";

    setTimeout(() => {
      button.textContent = "Adicionar ao Carrinho";
      button.style.backgroundColor = "";
    }, 2000);
  });
});

// // Filtro de categorias
// const categoryButtons = document.querySelectorAll(".categoria-botao");
// const menuSections = document.querySelectorAll(".secao-menu");

// categoryButtons.forEach((button) => {
//   button.addEventListener("click", () => {
//     // Remove active class from all buttons
//     categoryButtons.forEach((btn) => btn.classList.remove("active"));

//     // Add active class to clicked button
//     button.classList.add("active");

//     // Filter logic
//     const category = button.textContent.trim();

//     menuSections.forEach((section) => {
//       section.style.transition = "opacity 0.3s ease";
//       const sectionTitle = section.querySelector(".secao-titulo").textContent.trim();

//       if (category === "Todos" || sectionTitle === category) {
//         section.style.opacity = "1";
//       } else {
//         section.style.opacity = "0";
//       }
//     });
//   });
// });
