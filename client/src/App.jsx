import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [menu, setMenu] = useState(null);
  const [activeTab, setActiveTab] = useState("order");
  const [selectedPizzaId, setSelectedPizzaId] = useState("");
  const [selectedSizeId, setSelectedSizeId] = useState("");
  const [selectedToppingIds, setSelectedToppingIds] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [cart, setCart] = useState([]);
  const [trackingId, setTrackingId] = useState("");
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackingError, setTrackingError] = useState("");
  const [employeeOrders, setEmployeeOrders] = useState([]);
  const [employeeError, setEmployeeError] = useState("");
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [deliveryError, setDeliveryError] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3001/api/menu")
      .then((response) => response.json())
      .then((data) => {
        setMenu(data);
        setSelectedPizzaId(data.pizzas[0].id);
        setSelectedSizeId(data.sizes[0].id);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });
  }, []);

  function handleToppingChange(toppingId) {
    if (selectedToppingIds.includes(toppingId)) {
      setSelectedToppingIds(selectedToppingIds.filter((id) => id !== toppingId));
    } else {
      setSelectedToppingIds([...selectedToppingIds, toppingId]);
    }
  }

  function addToCart() {
    const pizza = menu.pizzas.find((item) => item.id === selectedPizzaId);
    const size = menu.sizes.find((item) => item.id === selectedSizeId);
    const toppings = menu.toppings.filter((item) =>
      selectedToppingIds.includes(item.id)
    );

    const cartItem = {
      pizzaId: pizza.id,
      pizzaName: pizza.name,
      sizeId: size.id,
      sizeName: size.name,
      toppingIds: toppings.map((topping) => topping.id),
      toppingNames: toppings.map((topping) => topping.name)
    };

    setCart([...cart, cartItem]);
    setSelectedToppingIds([]);
  }

  function getCartItemPrice(item) {
    const pizza = menu.pizzas.find((p) => p.id === item.pizzaId);
    const size = menu.sizes.find((s) => s.id === item.sizeId);

    if (!pizza || !size) {
      return 0;
    }

    let price = pizza.price + size.price;

    for (const toppingId of item.toppingIds || []) {
      const topping = menu.toppings.find((t) => t.id === toppingId);

      if (topping) {
        price += topping.price;
      }
    }

    return price;
  }

  function getCartSubtotal() {
    return cart.reduce((sum, item) => sum + getCartItemPrice(item), 0);
  }

  function getEstimatedDeliveryFee() {
    return getCartSubtotal() > 100 ? 0 : 10;
  }

  function calculateEstimatedPrice() {
    return getCartSubtotal() + getEstimatedDeliveryFee();
  }

  function formatOrderPizza(pizza) {
    const pizzaItem = menu.pizzas.find((p) => p.id === pizza.pizzaId);
    const sizeItem = menu.sizes.find((s) => s.id === pizza.sizeId);
    const toppingNames = (pizza.toppingIds || [])
      .map((id) => menu.toppings.find((t) => t.id === id)?.name)
      .filter(Boolean);

    const pizzaName = pizzaItem?.name ?? pizza.pizzaId;
    const sizeName = sizeItem?.name ?? pizza.sizeId;
    const toppingsLabel =
      toppingNames.length > 0 ? toppingNames.join(", ") : "No toppings";

    return `${pizzaName} | ${sizeName} | Toppings: ${toppingsLabel}`;
  }

  async function submitOrder() {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    const orderPayload = {
      customerName,
      phone,
      deliveryAddress,
      pizzas: cart.map((item) => ({
        pizzaId: item.pizzaId,
        sizeId: item.sizeId,
        toppingIds: item.toppingIds
      }))
    };

    try {
      const response = await fetch("http://localhost:3001/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Invalid order details");
        return;
      }
      setConfirmedOrder(data);

      alert(`Order created successfully!\nOrder ID: ${data.id}`);

      setCart([]);
      setCustomerName("");
      setPhone("");
      setDeliveryAddress("");
      setPaymentConfirmed(false);
    } catch (error) {
      console.error(error);
      alert("Failed to create order");
    }
  }

  async function checkOrderStatus() {
    setTrackedOrder(null);
    setTrackingError("");

    if (!trackingId) {
      setTrackingError("Please enter order ID");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/api/orders/${trackingId}`
      );

      const data = await response.json();

      if (!response.ok) {
        setTrackingError(data.error || "Order not found");
        return;
      }

      setTrackedOrder(data);
    } catch (error) {
      console.error(error);
      setTrackingError("Failed to fetch order");
    }
  }

  async function loadEmployeeOrders() {
    setEmployeeError("");

    try {
      const newResponse = await fetch("http://localhost:3001/api/orders?status=new");
      const preparingResponse = await fetch("http://localhost:3001/api/orders?status=preparing");

      const newOrders = await newResponse.json();
      const preparingOrders = await preparingResponse.json();

      setEmployeeOrders([...newOrders, ...preparingOrders]);
    } catch (error) {
      console.error(error);
      setEmployeeError("Failed to load employee orders");
    }
  }

  async function updateEmployeeOrderStatus(order) {
    const nextStatus = order.status === "new" ? "preparing" : "ready";

    try {
      const response = await fetch(
        `http://localhost:3001/api/orders/${order.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ status: nextStatus })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setEmployeeError(data.error || "Failed to update order");
        return;
      }

      loadEmployeeOrders();

      if (confirmedOrder && confirmedOrder.id === data.id) {
        setConfirmedOrder(data);
      }
    } catch (error) {
      console.error(error);
      setEmployeeError("Failed to update order status");
    }
  }

  async function loadDeliveryOrders() {
    setDeliveryError("");

    try {
      const response = await fetch("http://localhost:3001/api/orders?status=ready");
      const data = await response.json();

      setDeliveryOrders(data);
    } catch (error) {
      console.error(error);
      setDeliveryError("Failed to load delivery orders");
    }
  }

  async function markOrderAsDelivered(orderId) {
    try {
      const response = await fetch(
        `http://localhost:3001/api/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ status: "delivered" })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setDeliveryError(data.error || "Failed to update delivery order");
        return;
      }

      loadDeliveryOrders();
      if (confirmedOrder && confirmedOrder.id === data.id) {
        setConfirmedOrder(data);
      }
    } catch (error) {
      console.error(error);
      setDeliveryError("Failed to mark order as delivered");
    }
  }

  if (!menu) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading menu...</p>
      </div>
    );
  }

  const tabs = [
    { id: "order", label: "Order Pizza", icon: "🍕" },
    { id: "track", label: "Track Order", icon: "📦" },
    { id: "employee", label: "Kitchen", icon: "👨‍🍳" },
    { id: "delivery", label: "Delivery", icon: "🛵" }
  ];

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-icon">🍕</span>
          <div className="brand-text">
            <h1>Slice House</h1>
            <p>Fresh pizza, delivered hot</p>
          </div>
        </div>
        <span className="header-tag">Open · Order Now</span>
      </header>

      <div className="promo-banner">
        🚚 <span>Free delivery</span> on orders above ₪100
      </div>

      <nav className="app-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {activeTab === "order" && (
          <div className="order-layout">
            <section data-testid="menu-list" className="card">
              <h2 className="card-title">🍕 Build Your Pizza</h2>

              <p className="card-subtitle">Choose Pizza</p>
              <div className="form-group">
                <select
                  className="form-select"
                  value={selectedPizzaId}
                  onChange={(event) => setSelectedPizzaId(event.target.value)}
                >
                  {menu.pizzas.map((pizza) => (
                    <option key={pizza.id} value={pizza.id}>
                      {pizza.name} — ₪{pizza.price}
                    </option>
                  ))}
                </select>
              </div>

              <p className="card-subtitle">Choose Size</p>
              <div className="form-group">
                <select
                  className="form-select"
                  value={selectedSizeId}
                  onChange={(event) => setSelectedSizeId(event.target.value)}
                >
                  {menu.sizes.map((size) => (
                    <option key={size.id} value={size.id}>
                      {size.name} — ₪{size.price}
                    </option>
                  ))}
                </select>
              </div>

              <p className="card-subtitle">Choose Toppings</p>
              <div className="toppings-grid">
                {menu.toppings.map((topping) => (
                  <label key={topping.id} className="topping-option">
                    <input
                      type="checkbox"
                      checked={selectedToppingIds.includes(topping.id)}
                      onChange={() => handleToppingChange(topping.id)}
                    />
                    {topping.name}
                    <span className="topping-price">+₪{topping.price}</span>
                  </label>
                ))}
              </div>

              <button className="btn btn-primary btn-block" onClick={addToCart} style={{ marginTop: "1.25rem" }}>
                Add to Cart
              </button>
            </section>

            <aside className="order-sidebar">
              <section className="card">
                <h2 className="card-title">👤 Your Details</h2>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Customer Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="050-0000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Delivery Address</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Street, City"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  />
                </div>
              </section>

              <section data-testid="cart" className="card">
                <h2 className="card-title">🛒 Your Cart</h2>
                {cart.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">🛒</div>
                    <p>No pizzas in cart yet.</p>
                  </div>
                ) : (
                  <ul className="item-list">
                    {cart.map((item, index) => (
                      <li key={index}>
                        <strong>{item.pizzaName}</strong> · {item.sizeName}
                        <br />
                        <small>
                          {item.toppingNames.length > 0
                            ? item.toppingNames.join(", ")
                            : "No toppings"}
                        </small>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section data-testid="order-summary-panel" className="card">
                <h2 className="card-title">📋 Order Summary</h2>

                {cart.length === 0 ? (
                  <div className="empty-state">
                    <p>No items to summarize.</p>
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                      {cart.length} pizza{cart.length > 1 ? "s" : ""} in order
                    </p>

                    <ul className="item-list">
                      {cart.map((item, index) => (
                        <li key={index}>
                          {item.pizzaName} · {item.sizeName}
                          <br />
                          <small>
                            {item.toppingNames.length > 0
                              ? item.toppingNames.join(", ")
                              : "No toppings"}
                          </small>
                          <span className="item-price">₪{getCartItemPrice(item)}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="price-breakdown">
                      <div className="price-row">
                        <span>Subtotal</span>
                        <span>₪{getCartSubtotal()}</span>
                      </div>
                      <div className="price-row">
                        <span>Delivery fee</span>
                        <span>
                          ₪{getEstimatedDeliveryFee()}
                          {getEstimatedDeliveryFee() === 0 && " ✓"}
                        </span>
                      </div>
                      <div className="price-row total">
                        <span>Estimated total</span>
                        <span>₪{calculateEstimatedPrice()}</span>
                      </div>
                      <p className="price-note">Final price will be calculated by the server.</p>
                    </div>

                    <label className="payment-check">
                      <input
                        type="checkbox"
                        checked={paymentConfirmed}
                        onChange={(e) => setPaymentConfirmed(e.target.checked)}
                      />
                      I confirm simulated payment
                    </label>
                  </>
                )}

                <button
                  className="btn btn-primary btn-block"
                  data-testid="checkout-button"
                  disabled={!paymentConfirmed || cart.length === 0}
                  onClick={submitOrder}
                >
                  Place Order
                </button>
              </section>

              {confirmedOrder && (
                <section data-testid="order-confirmation" className="card confirmation-card">
                  <h2 className="card-title">✅ Order Confirmed!</h2>
                  <div className="confirmation-details">
                    <p>Order ID: <strong>{confirmedOrder.id}</strong></p>
                    <p>
                      Status:{" "}
                      <span className={`status-badge status-${confirmedOrder.status}`}>
                        {confirmedOrder.status}
                      </span>
                    </p>
                    <p>Total Price: <strong>₪{confirmedOrder.totalPrice}</strong></p>
                  </div>
                </section>
              )}
            </aside>
          </div>
        )}

        {activeTab === "track" && (
          <section className="card">
            <h2 className="card-title">📦 Track Your Order</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "1rem", fontSize: "0.9rem" }}>
              Enter your order ID to see the current status.
            </p>

            <div className="track-form">
              <input
                className="form-input"
                type="text"
                placeholder="Enter Order ID"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
              />
              <button className="btn btn-primary" onClick={checkOrderStatus}>
                Check Status
              </button>
            </div>

            {trackingError && <div className="alert alert-error">{trackingError}</div>}

            {trackedOrder && (
              <div className="track-result card" style={{ background: "var(--cream)" }}>
                <div className="order-card-header">
                  <span className="order-id">Order #{trackedOrder.id}</span>
                  <span className={`status-badge status-${trackedOrder.status}`}>
                    {trackedOrder.status}
                  </span>
                </div>
                <p className="order-meta">Payment: <strong>{trackedOrder.paymentStatus}</strong></p>
                <p className="order-meta">Total: <strong>₪{trackedOrder.totalPrice}</strong></p>
              </div>
            )}
          </section>
        )}

        {activeTab === "employee" && (
          <div data-testid="employee-orders">
            <div className="section-header">
              <h2>👨‍🍳 Kitchen — Active Orders</h2>
              <button className="btn btn-secondary" onClick={loadEmployeeOrders}>
                Refresh Orders
              </button>
            </div>

            {employeeError && <div className="alert alert-error">{employeeError}</div>}

            {employeeOrders.length === 0 ? (
              <div className="card empty-state">
                <div className="empty-state-icon">👨‍🍳</div>
                <p>No active orders. Click "Refresh Orders" to load.</p>
              </div>
            ) : (
              <div className="orders-grid">
                {employeeOrders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-card-header">
                      <span className="order-id">#{order.id}</span>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="order-meta">Customer: <strong>{order.customerName}</strong></p>
                    <p className="order-meta">Price: <strong>₪{order.totalPrice}</strong></p>
                    <p className="card-subtitle" style={{ marginTop: "0.5rem" }}>Items</p>
                    <ul className="order-items">
                      {order.pizzas.map((pizza, index) => (
                        <li key={index}>{formatOrderPizza(pizza)}</li>
                      ))}
                    </ul>
                    <div className="order-card-actions">
                      <button
                        className="btn btn-primary btn-sm btn-block"
                        onClick={() => updateEmployeeOrderStatus(order)}
                      >
                        Move to {order.status === "new" ? "preparing" : "ready"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "delivery" && (
          <div data-testid="delivery-orders">
            <div className="section-header">
              <h2>🛵 Delivery — Ready Orders</h2>
              <button className="btn btn-secondary" onClick={loadDeliveryOrders}>
                Refresh Orders
              </button>
            </div>

            {deliveryError && <div className="alert alert-error">{deliveryError}</div>}

            {deliveryOrders.length === 0 ? (
              <div className="card empty-state">
                <div className="empty-state-icon">🛵</div>
                <p>No ready orders for delivery. Click "Refresh Orders" to load.</p>
              </div>
            ) : (
              <div className="orders-grid">
                {deliveryOrders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-card-header">
                      <span className="order-id">#{order.id}</span>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="order-meta">Customer: <strong>{order.customerName}</strong></p>
                    <p className="order-meta">Phone: <strong>{order.phone}</strong></p>
                    <p className="order-meta">Address: <strong>{order.deliveryAddress}</strong></p>
                    <div className="order-card-actions">
                      <button
                        className="btn btn-success btn-sm btn-block"
                        onClick={() => markOrderAsDelivered(order.id)}
                      >
                        Mark as Delivered
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
