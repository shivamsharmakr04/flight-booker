# Flight Booker

A full-stack flight reservation application built with React, Node.js, Express, Tailwind CSS, and JWT authentication. It demonstrates a complete booking workflow from flight search to seat selection, checkout, booking history, and PDF ticket generation.

## Highlights

- Flight search, filtering, and fare sorting
- AI trip planner with natural-language flight recommendations from the live inventory
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

Set `OPENAI_API_KEY` in the backend process environment before starting the server. Optionally set `OPENAI_MODEL` to use a different OpenAI chat-completions model (default: `gpt-4o-mini`). For example, in PowerShell:

```powershell
$env:OPENAI_API_KEY = "your-openai-api-key"
npm start
```

The key is only read by the backend and must never be added to frontend variables or committed to source control. Without a key, flight search and booking continue to work; the assistant reports that it is not configured. The current flight inventory does not include schedules or date availability, so the assistant does not claim to verify flight times or dates.

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
| `POST` | `/api/assistant/chat` | Receive inventory-grounded trip recommendations |

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
