const orders = [];

function getAllOrders() {
  return orders;
}

function addOrder(order) {
  orders.push(order);
  return order;
}

function getOrderById(id) {
  return orders.find((order) => order.id === id);
}

function getOrdersByStatus(status) {
  return orders.filter((order) => order.status === status);
}

module.exports = {
  getAllOrders,
  addOrder,
  getOrderById,
  getOrdersByStatus
};