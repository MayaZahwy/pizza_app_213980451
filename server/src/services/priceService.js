const menu = require("../data/menu");

function calculateOrderPrice(pizzas) {
  let totalPrice = 0;

  for (const pizza of pizzas) {
    const menuPizza = menu.pizzas.find((item) => item.id === pizza.pizzaId);
    const menuSize = menu.sizes.find((item) => item.id === pizza.sizeId);

    totalPrice += menuPizza.price;
    totalPrice += menuSize.price;

    for (const toppingId of pizza.toppingIds) {
      const topping = menu.toppings.find((item) => item.id === toppingId);
      totalPrice += topping.price;
    }
  }

  return totalPrice;
}

module.exports = {
  calculateOrderPrice
};