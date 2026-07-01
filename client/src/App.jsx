import { useEffect, useState } from "react";

function App() {
  const [menu, setMenu] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3001/api/menu")
      .then((response) => {
        console.log("Response:", response);
        return response.json();
      })
      .then((data) => {
        console.log("Menu data:", data);
        setMenu(data);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });
  }, []);

  if (!menu) {
    return <h2>Loading menu...</h2>;
  }

  return (
    <div>
      <h1>Pizza App</h1>

      <div data-testid="menu-list">
        <h2>Menu</h2>

        <h3>Pizzas</h3>
        <ul>
          {menu.pizzas.map((pizza) => (
            <li key={pizza.id}>
              {pizza.name} - ₪{pizza.price}
            </li>
          ))}
        </ul>

        <h3>Sizes</h3>
        <ul>
          {menu.sizes.map((size) => (
            <li key={size.id}>
              {size.name} - ₪{size.price}
            </li>
          ))}
        </ul>

        <h3>Toppings</h3>
        <ul>
          {menu.toppings.map((topping) => (
            <li key={topping.id}>
              {topping.name} - ₪{topping.price}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;