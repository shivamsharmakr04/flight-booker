# Flight Booker

A full-stack flight reservation application built with React, Node.js, Express, Tailwind CSS, and JWT authentication. It demonstrates a complete booking workflow from flight search to seat selection, checkout, booking history, and PDF ticket generation.

## Highlights

- Flight search, filtering, and fare sorting
- Real-time AI trip planner with streamed replies and natural-language flight recommendations from the live inventory
- Interactive seat selection and passenger management
- Payment-flow simulation and wallet workflow
- JWT authentication and booking history
- Digital boarding passes and server-side PDF ticket generation
- Responsive UI with Tailwind CSS

## Tech Stack

- **Frontend:** React, Vite, React Router, Tailwind CSS, Framer Motion, Axios
- **Backend:** Node.js, Express.js
- **Authentication:** JWT
- **Database:** MongoDB
- **PDF:** PDFKit

## Booking Flow

```text
Search → Select Flight → Choose Seats → Passenger Details → Checkout → Confirm Booking → Generate E-Ticket
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- MongoDB

### Backend

```bash
cd backend
npm install
npm start
```

The backend starts on `http://localhost:4000` by default. Set `MONGO_URI` if MongoDB is not running at `mongodb://localhost:27017/flightdb`.

### Configure the AI trip planner

Copy `backend/.env.example` to `backend/.env` and set `GEMINI_API_KEY` to a key from [Google AI Studio](https://aistudio.google.com/apikey) before starting the backend. The default model is `gemini-2.5-flash`; optionally set `GEMINI_MODEL` to another Gemini model that supports streaming and function calling. The key is only read by the backend and must never be added to frontend variables or committed to source control.

```powershell
Copy-Item backend/.env.example backend/.env
# Edit backend/.env and set GEMINI_API_KEY to your Google AI Studio key.
Set-Location backend
npm start
```

Without a key, flight search and booking continue to work; the assistant explains how to configure the missing key. Assistant replies stream to the chat as they are generated. The current flight inventory does not include schedules or date availability, so the assistant does not claim to verify flight times or dates.

### Frontend

From the repository root, open another terminal and run:

```bash
npm install
npm run dev
```

The frontend launches on `http://localhost:5173`.

## API Reference

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register a new account |
| `POST` | `/api/auth/login` | Authenticate a user |

### Flights (`/api/flights`)

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/flights/search` | Search flights by departure, arrival, and travel date |

### AI Trip Planner (`/api/assistant`)

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/assistant/chat/stream` | Stream inventory-grounded trip recommendations |

### Bookings and Wallet (`/api/bookings`)

| Method | Endpoint | Description | Authentication |
| --- | --- | --- | --- |
| `POST` | `/api/bookings/preview` | Preview the price breakdown and lock the fare | Yes |
| `POST` | `/api/bookings/book` | Confirm a flight booking | Yes |
| `POST` | `/api/bookings/wallet/add` | Add funds to the wallet | Yes |
| `GET` | `/api/bookings/history` | Retrieve booking history and e-tickets | Yes |

## What This Project Demonstrates

- Multi-step application workflows
- REST API integration and authentication
- State management and checkout UX
- AI-assisted discovery grounded in application data
- PDF generation and responsive frontend development

## License

This project is licensed under the MIT License.

## Author

**Shivam Kumar** — Full-Stack Developer

[GitHub](https://github.com/shivamsharmakr04) · [LinkedIn](https://linkedin.com/in/shivam-kumar-b0aab2209)
