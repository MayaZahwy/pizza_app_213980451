const menu = require("../data/menu");

const DEFAULT_DELIVERY_FEE = 10;
const FREE_DELIVERY_MIN_PRICE = 100;

function calculateOrderPrice(pizzas) {
  let pizzasPrice = 0;

  for (const pizza of pizzas) {
    const menuPizza = menu.pizzas.find((item) => item.id === pizza.pizzaId);
    const menuSize = menu.sizes.find((item) => item.id === pizza.sizeId);

    pizzasPrice += menuPizza.price;
    pizzasPrice += menuSize.price;

    for (const toppingId of pizza.toppingIds) {
      const topping = menu.toppings.find((item) => item.id === toppingId);
      pizzasPrice += topping.price;
    }
  }

  const deliveryFee =
    pizzasPrice > FREE_DELIVERY_MIN_PRICE ? 0 : DEFAULT_DELIVERY_FEE;

  return {
    pizzasPrice,
    deliveryFee,
    totalPrice: pizzasPrice + deliveryFee
  };
}

module.exports = {
  calculateOrderPrice
};