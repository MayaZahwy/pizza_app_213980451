const express = require("express");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const menu = require("./data/menu");

const { addOrder } = require("./orders/ordersStore");

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Pizza server is running"
  });
});

app.get("/api/menu", (req, res) => {
    res.status(200).json(menu);
  });

app.post("/api/orders", (req, res) => {
const { customerName, phone, deliveryAddress, pizzas } = req.body;

if (!customerName || !phone || !deliveryAddress) {
    return res.status(400).json({
    error: "Customer name, phone and delivery address are required"
    });
}

if (!Array.isArray(pizzas) || pizzas.length === 0) {
    return res.status(400).json({
    error: "Order must include at least one pizza"
    });
}

for (const pizza of pizzas) {
    const menuPizza = menu.pizzas.find((item) => item.id === pizza.pizzaId);

    if (!menuPizza) {
    return res.status(400).json({
        error: "Invalid pizza id"
    });
    }

    const menuSize = menu.sizes.find((item) => item.id === pizza.sizeId);

    if (!menuSize) {
    return res.status(400).json({
        error: "Invalid size id"
    });
    }

    if (!Array.isArray(pizza.toppingIds)) {
    return res.status(400).json({
        error: "toppingIds must be an array"
    });
    }

    if (pizza.toppingIds.length > 3) {
    return res.status(400).json({
        error: "A pizza cannot have more than three toppings"
    });
    }

    for (const toppingId of pizza.toppingIds) {
    const menuTopping = menu.toppings.find((item) => item.id === toppingId);

    if (!menuTopping) {
        return res.status(400).json({
        error: "Invalid topping id"
        });
    }
    }
}

const newOrder = {
    id: Date.now().toString(),
    customerName,
    phone,
    deliveryAddress,
    pizzas,
    totalPrice: 0,
    status: "new",
    paymentStatus: "paid",
    createdAt: new Date().toISOString()
};

addOrder(newOrder);

return res.status(201).json(newOrder);
});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});