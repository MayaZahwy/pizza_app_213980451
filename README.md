# pizza_app_213980451

## Students

- Maya Zahwy – 213980451

---

## GitHub Repository

Repository Link:

https://github.com/MayaZahwy/pizza_app_213980451.git

---

## Project Structure

pizza_app_213980451

│
├── server
│   ├── src
│   ├── package.json
│
├── client
│   ├── src
│   ├── package.json
│
└── README.md


### Server Side

Built using:

- Node.js
- Express
- REST API

The server is responsible for:

- Returning the menu
- Creating orders
- Validating orders
- Calculating prices
- Storing orders in memory
- Managing order statuses

---

### Client Side

Built using:

- React
- Vite

The client is responsible for:

- Displaying the menu
- Building orders
- Managing the cart
- Simulating payment
- Tracking orders
- Employee and delivery management screens

---

# Installation and Running Instructions

## Running the Server

```bash
cd server
npm install
npm start
```

Server URL:

http://localhost:3001


---

## Running the Client

```bash
cd client
npm install
npm run dev
```

Client URL:

http://localhost:5173

---

# System Features

## Customer Features

The customer can:

- View the menu received from the server
- Select pizzas
- Select pizza sizes
- Select toppings
- Add items to the cart
- View estimated order price
- Enter customer information
- Perform a simulated payment
- Create an order
- Receive an order ID
- Track an order using its ID

---

## Restaurant Employee Features

The employee can:

- View orders in "new" status
- View orders in "preparing" status
- Update orders from "new" to "preparing"
- Update orders from "preparing" to "ready"

---

## Delivery Features

The delivery person can:

- View orders in "ready" status
- View customer details and delivery address
- Mark orders as "delivered"

---

# Price Calculation

The final order price is calculated only on the server.

The client displays an estimated price only.

The server is the source of truth and does not trust prices sent from the client.

The price calculation includes:

- Pizza prices
- Size additions
- Toppings
- Delivery fee (according to the personal business rule)

---

# Personal Business Rule

The last digit of the submitting student's ID is:

1


Therefore, the assigned business rule is:

Orders above 100 NIS receive free delivery.


Implementation:

- If the order price is greater than 100 NIS:

Delivery Fee = 0


- Otherwise:

Delivery Fee = 10


The rule is implemented in:

server/src/services/priceService.js


---

# Changes From Homework 1

The overall system design remained similar to the original design.

Several simplifications were made:

- No database was used.
- Orders are stored in memory only.
- No authentication or authorization system was implemented.
- Payment is simulated only.

These changes were made according to the homework requirements.

---

# Answers to Required Questions

## שאלה 1 – מה ההבדל בין צד הלקוח לצד השרת במערכת שלכם?

צד הלקוח הוא ממשק המשתמש שנכתב ב־ React ומאפשר למשתמש לבצע פעולות במערכת.

צד השרת הוא שירות REST API שנכתב באמצעות Node.js ו־Express והוא אחראי על בדיקות תקינות, חישוב מחירים, שמירת הזמנות וניהול מצבי הזמנה.

---

## שאלה 2 – איפה מחושב המחיר הכולל ולמה?

המחיר הכולל מחושב בצד השרת בלבד.

הסיבה לכך היא שמשתמש יכול לשנות את קוד הדפדפן ולכן אסור לסמוך על מחירים שמגיעים מהלקוח.

השרת מחשב מחדש את המחיר לפי התפריט והבחירות התקינות.

---

## שאלה 3 – מה קורה כאשר לקוח שולח הזמנה לא תקינה?

השרת בודק את תקינות הנתונים.

אם חסרים נתונים חובה או קיימים נתונים לא תקינים, השרת מחזיר:

HTTP 400 Bad Request

וההזמנה אינה נוצרת.

---

## שאלה 4 – מה קורה לאחר שהתשלום המדומה מצליח?

הלקוח שולח את ההזמנה לשרת.

השרת:

- בודק את תקינות ההזמנה
- מחשב את המחיר
- יוצר מזהה הזמנה ייחודי
- שומר את ההזמנה בזיכרון
- מגדיר את מצב ההזמנה כ־new
- מחזיר את פרטי ההזמנה ללקוח

---

## שאלה 5 – מהו הכלל האישי שחל עליכם?

הכלל האישי הוא:

בהזמנה שמחירה מעל 100 ש"ח אין דמי משלוח.


---

## שאלה 6 – מה היה החלק הכי מאתגר בתרגיל?

החלק המאתגר ביותר היה החיבור בין צד הלקוח לצד השרת והטיפול במעברי מצב חוקיים של ההזמנות.

נדרש לוודא שכל המעברים בין המצבים מתבצעים לפי הכללים שהוגדרו במערכת.

---

## שאלה 7 – איזו החלטת תכנון אחת קיבלתם ולמה?

החלטנו שהשרת יהיה מקור האמת של המערכת.

כל בדיקות התקינות, חישובי המחירים ומעברי המצבים מתבצעים בשרת בלבד.

החלטה זו משפרת את אמינות המערכת ומונעת ממשתמשים לעקוף את חוקי המערכת דרך הדפדפן.