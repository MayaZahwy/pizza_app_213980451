import { useEffect, useState } from "react";

function App() {
  const [menu, setMenu] = useState(null);
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

  function calculateEstimatedPrice() {
    let total = 0;

    for (const item of cart) {
      const pizza = menu.pizzas.find((p) => p.id === item.pizzaId);
      const size = menu.sizes.find((s) => s.id === item.sizeId);

      if (!pizza || !size) {
        continue;
      }

      total += pizza.price;
      total += size.price;

      for (const toppingId of item.toppingIds || []) {
        const topping = menu.toppings.find((t) => t.id === toppingId);

        if (topping) {
          total += topping.price;
        }
      }
    }

    return total;
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
  
      alert(`Order created successfully!\nOrder ID: ${data.id}`);
  
      setCart([]);
      setCustomerName("");
      setPhone("");
      setDeliveryAddress("");
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
    } catch (error) {
      console.error(error);
      setEmployeeError("Failed to update order status");
    }
  }


  if (!menu) {
    return <h2>Loading menu...</h2>;
  }

  return (
    <div>
      <h1>Pizza App</h1>

      <div data-testid="menu-list">
        <h2>Menu</h2>

        <h3>Choose Pizza</h3>
        <select
          value={selectedPizzaId}
          onChange={(event) => setSelectedPizzaId(event.target.value)}
        >
          {menu.pizzas.map((pizza) => (
            <option key={pizza.id} value={pizza.id}>
              {pizza.name} - ₪{pizza.price}
            </option>
          ))}
        </select>

        <h3>Choose Size</h3>
        <select
          value={selectedSizeId}
          onChange={(event) => setSelectedSizeId(event.target.value)}
        >
          {menu.sizes.map((size) => (
            <option key={size.id} value={size.id}>
              {size.name} - ₪{size.price}
            </option>
          ))}
        </select>

        <h3>Choose Toppings</h3>
        {menu.toppings.map((topping) => (
          <label key={topping.id} style={{ display: "block" }}>
            <input
              type="checkbox"
              checked={selectedToppingIds.includes(topping.id)}
              onChange={() => handleToppingChange(topping.id)}
            />
            {topping.name} - ₪{topping.price}
          </label>
        ))}

        <br />

        <button onClick={addToCart}>Add To Cart</button>
      </div>

      <hr />

      <hr />

      <h2>Customer Details</h2>

      <input
        type="text"
        placeholder="Customer Name"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
      />

      <br />
      <br />

      <input
        type="text"
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <br />
      <br />

      <input
        type="text"
        placeholder="Delivery Address"
        value={deliveryAddress}
        onChange={(e) => setDeliveryAddress(e.target.value)}
      />

      <br />
      <br />

      <div data-testid="cart">
        <h2>Cart</h2>

        {cart.length === 0 ? (
          <p>No pizzas in cart yet.</p>
        ) : (
          <ul>
            {cart.map((item, index) => (
              <li key={index}>
                <strong>{item.pizzaName}</strong> | {item.sizeName} | Toppings:{" "}
                {item.toppingNames.length > 0
                  ? item.toppingNames.join(", ")
                  : "No toppings"}
              </li>
            ))}
          </ul>
        )}
      </div>

      <hr />

      <div data-testid="order-summary-panel">
        <h2>Order Summary</h2>

        {cart.length === 0 ? (
          <p>No items to summarize.</p>
        ) : (
          <>
            <p>Number of pizzas: {cart.length}</p>

            <ul>
              {cart.map((item, index) => (
                <li key={index}>
                  {item.pizzaName} - {item.sizeName} -{" "}
                  {item.toppingNames.length > 0
                    ? item.toppingNames.join(", ")
                    : "No toppings"}
                </li>
              ))}
            </ul>

            <h3>Estimated Total: ₪{calculateEstimatedPrice()}</h3>
            <p>Final price will be calculated by the server.</p>
          </>
        )}

        <button onClick={submitOrder}>
          Place Order
        </button>

      </div>

      <hr />

      <div>
        <h2>Track Order</h2>

        <input
          type="text"
          placeholder="Enter Order ID"
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
        />

        <button onClick={checkOrderStatus}>Check Status</button>

        {trackingError && <p>{trackingError}</p>}

        {trackedOrder && (
          <div>
            <h3>Order #{trackedOrder.id}</h3>
            <p>Status: {trackedOrder.status}</p>
            <p>Payment: {trackedOrder.paymentStatus}</p>
            <p>Total Price: ₪{trackedOrder.totalPrice}</p>
          </div>
        )}
      </div>

      <hr />

      <div data-testid="employee-orders">
        <h2>Employee Orders</h2>

        <button onClick={loadEmployeeOrders}>Load Active Orders</button>

        {employeeError && <p>{employeeError}</p>}

        {employeeOrders.length === 0 ? (
          <p>No active orders.</p>
        ) : (
          <ul>
            {employeeOrders.map((order) => (
              <li key={order.id}>
                <strong>Order #{order.id}</strong>
                <br />
                Customer: {order.customerName}
                <br />
                Price: ₪{order.totalPrice}
                <br />
                Status: {order.status}
                <br />
                <button onClick={() => updateEmployeeOrderStatus(order)}>
                  Move to {order.status === "new" ? "preparing" : "ready"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>

    
  );
}

export default App;