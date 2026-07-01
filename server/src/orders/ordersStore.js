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

function updateOrderStatus(id, newStatus) {
  const order = orders.find((order) => order.id === id);

  if (!order) {
    return null;
  }

  order.status = newStatus;

  return order;
}

module.exports = {
  getAllOrders,
  addOrder,
  getOrderById,
  getOrdersByStatus,
  updateOrderStatus
};