const orders = [];

function getAllOrders() {
  return orders;
}

function addOrder(order) {
  orders.push(order);
  return order;
}

module.exports = {
  getAllOrders,
  addOrder
};