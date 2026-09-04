# ✈️ Flight Booker – Full-Stack Flight Reservation System

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=json-web-tokens)](https://jwt.io/)

A modern, high-performance, full-stack flight booking web application built with an **Executive Classic & Glassmorphic UI**, real-time search filtering, dynamic demand surge pricing, multi-channel payment gateway (UPI, Credit/Debit Cards, Net Banking, SkyWallet), interactive seat layout picker, and instant PDF boarding pass generation.

---

## 🌟 Key Features

### 🔍 Real-Time Flight Search & Dynamic Surge Pricing
- **Popular Route Quick Chips**: 1-click instant search for trending routes (`Delhi ➔ Mumbai`, `Bangalore ➔ Goa`, `Mumbai ➔ Dubai`).
- **Interactive Location Swap**: 180° animated rotation button to swap departure and destination inputs.
- **Dynamic Price Filtering**: Real-time price slider, airline filter dropdowns, and sorting (Price Low to High, High to Low, Airline A-Z).
- **Demand Surge Engine**: Backend monitors flight search attempts and automatically adjusts surge fares during peak demand windows.

### 💳 Multi-Channel Real-Time Payment Gateway
- **UPI & VPA Payment**: Auto-fill demo UPI ID, custom VPA input (e.g. `name@okicici`), handle quick chips (`@okaxis`, `@ybl`, `@paytm`), and app selection (GPay, PhonePe, Paytm).
- **Credit / Debit Cards**: Cardholder name, card number with **real-time brand detection** (VISA, Mastercard, RuPay, AMEX), Expiry (`MM/YY`), and CVV.
- **Net Banking**: Instant bank selection grid (HDFC Bank, ICICI Bank, State Bank of India, Axis Bank, Kotak Bank).
- **SkyWallet & Instant Top-Up**: Live wallet balance display with an interactive **+ Top-up ₹2,000** button inside the checkout wizard.
- **Real-Time Gateway Overlay**: Animated 256-Bit SSL payment authorization overlay.

### 🎟️ 3-Step Interactive Booking Wizard
- **Step 1: Seat & Date Selection**: Choose preferred seat types (Window, Aisle, Middle) and pick specific seats from an interactive flight seat grid simulator (`12A`, `12B`, `12C`).
- **Step 2: Passenger Management**: Add multiple passengers, enter phone/email details, and assign cabin classes.
- **Step 3: Custom Payment & Price Lock**: Fare price lock countdown timer (10-minute lock) with detailed tax and convenience fee breakdowns.

### 📄 Digital Boarding Passes & PDF Ticket Generator
- **Visual E-Ticket Cards**: Boarding passes complete with PNR codes, departure/arrival airport codes, passenger badges, and barcode graphics.
- **Instant PDF Downloads**: Server-side PDF ticket generation (`PDFKit`) allowing 1-click ticket downloads (`/tickets/:pnr.pdf`).

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, React Router DOM v7, Tailwind CSS v3, Framer Motion, Axios, Vite |
| **Backend** | Node.js, Express.js, JWT Authentication, PDFKit |
| **Styling & Icons** | Executive Classic & Glassmorphism Theme, Custom SVG Icons |
| **Database** | MongoDB / In-Memory Mock Store |

---

## 📂 Project Architecture

```text
flight-booking-app/
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js             # JWT authentication middleware
│   │   ├── models/
│   │   │   ├── User.js             # User & Wallet balance model
│   │   │   ├── Flight.js           # Flight schedule & pricing model
│   │   │   ├── Booking.js          # Booking & PNR schema
│   │   │   └── Attempt.js          # Surge pricing attempt tracker
│   │   ├── routes/
│   │   │   ├── auth.js             # User register & login endpoints
│   │   │   ├── flights.js          # Flight search & availability API
│   │   │   ├── bookings.js         # Booking, preview, wallet top-up API
│   │   │   └── contact.js          # Contact message API
│   │   ├── utils/
│   │   │   ├── pnr.js              # PNR generator
│   │   │   └── pdfGenerator.js     # PDFKit E-ticket generator
│   │   ├── app.js
│   │   └── server.js               # Express server entry point (Port 4000)
│   ├── tickets/                    # Generated PDF tickets storage
│   └── package.json
│
├── src/                            # Frontend source code (Vite + React)
│   ├── components/
│   │   ├── Navbar.jsx              # Executive header with live wallet pill
│   │   ├── FlightCard.jsx          # Flight card with amenities accordion
│   │   ├── BookingModal.jsx        # 3-step wizard with seat picker & payment
│   │   ├── Footer.jsx              # Executive footer & price alert subscription
│   │   └── NotificationSystem.jsx  # Context-based toast notification system
│   ├── pages/
│   │   ├── Search.jsx              # Hero banner, route chips, flight list
│   │   ├── BookingHistory.jsx      # Digital boarding pass dashboard
│   │   ├── Signin.jsx              # Auth page with demo login auto-fill
│   │   ├── Register.jsx            # Account creation page
│   │   ├── About.jsx               # Stats counters & company values
│   │   └── Contact.jsx             # Contact form with instant alerts
│   ├── styles/
│   │   └── tailwind.css            # Classic utility classes
│   ├── api.js                      # Centralized Axios API client
│   ├── App.jsx                     # Main layout & routing setup
│   └── main.jsx
│
├── package.json
└── README.md
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- **Node.js** (v18.0 or higher)
- **npm** (v9.0 or higher)

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/himanshu9771/flight-booker.git
cd flight-booking-frontend
```

### 2️⃣ Backend Setup
```bash
cd backend
npm install
npm start
```
> The backend server will start on **`http://localhost:4000`**.

### 3️⃣ Frontend Setup
In a new terminal window, navigate to the root directory:
```bash
cd flight-booking-frontend
npm install
npm run dev
```
> The frontend application will launch on **`http://localhost:5173`**.

---

## 📡 API Reference Guide

### 🔐 Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new account (Grants ₹1,500 bonus wallet credit) |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token |

### ✈️ Flights Endpoints (`/api/flights`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/flights/search` | Search flights by departure, arrival, and travel date |

### 💳 Bookings & Wallet Endpoints (`/api/bookings`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/bookings/preview` | Preview total price breakdown & lock fare for 10 min | Yes |
| `POST` | `/api/bookings/book` | Confirm flight booking (UPI, Card, NetBanking, Wallet) | Yes |
| `POST` | `/api/bookings/wallet/add` | Top-up SkyWallet balance in real time | Yes |
| `GET` | `/api/bookings/history` | Retrieve user's booking history and e-tickets | Yes |

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Shivam Kumar**  
*Full-Stack Web Developer*  

⭐ If you find this project useful, don't forget to **star the repository**!
