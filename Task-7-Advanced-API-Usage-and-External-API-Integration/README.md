# Task 7: Advanced API Usage and External API Integration

This folder contains the complete, production-ready solution for **Task 7: Advanced API Usage and External API Integration**, implemented as part of the Cognifyz Full Stack Development Internship.

It showcases advanced API paradigms, secure JWT authentication, rate limiting, request validation, global error handling, and external API integration (OpenWeatherMap) with MongoDB auditing. Additionally, a premium web dashboard is included to provide a visual interface.

---

## Folder Structure

```text
Task-7-Advanced-API-Usage-and-External-API-Integration/
│
├── config/
│   └── db.js                 # MongoDB Mongoose connection and status events
│
├── controllers/
│   ├── authController.js     # User registration, login, and profile fetching logic
│   └── weatherController.js  # Weather lookup, query logger, and history actions
│
├── middleware/
│   ├── authMiddleware.js     # Extracts and validates JWT Authorization tokens
│   ├── errorMiddleware.js    # Catch-all API and Mongoose formatter
│   ├── rateLimitMiddleware.js# Express rate-limiting thresholds
│   └── validationMiddleware.js# Payload validators using express-validator
│
├── models/
│   ├── User.js               # MongoDB Mongoose User schema (with bcrypt pre-hooks)
│   └── SearchHistory.js      # MongoDB Mongoose SearchHistory schema
│
├── public/                   # Premium Dashboard Frontend UI
│   ├── css/
│   │   └── style.css         # Dark theme & glassmorphic layout styles
│   ├── js/
│   │   └── app.js            # Main client app, HTTP logger, state manager
│   └── index.html            # Responsive HTML grid layout
│
├── utils/
│   └── weatherService.js     # Client wrapper for OpenWeatherMap (with Mock fallback)
│
├── .env                      # Active environment variables (gitignored)
├── .env.example              # Template configuration structure
├── server.js                 # Application entry point
└── package.json              # Script configurations and packages
```

---

## Required npm Packages

The following dependencies are used:
* **`express`**: Web framework.
* **`mongoose`**: MongoDB connection and data modeling.
* **`bcryptjs`**: Password hashing.
* **`jsonwebtoken`**: JWT generation and parsing.
* **`express-rate-limit`**: Brute-force and API flood protection.
* **`express-validator`**: Input validation schemas.
* **`cors`**: Enabling Cross-Origin Resource Sharing.
* **`axios`**: Making external Weather API requests.
* **`dotenv`**: Injecting environment variables.
* **`nodemon`** (dev): Auto-restarting server on file changes.

---

## Installation & Setup

### Prerequisites
* **Node.js** (v18.0.0 or higher recommended, tested on `v22.22.0`)
* **MongoDB** (local server running on `mongodb://127.0.0.1:27017`)

### Installation Steps

1. **Navigate to Task 7 Directory**:
   ```bash
   cd Task-7-Advanced-API-Usage-and-External-API-Integration
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in details:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/task7db
   JWT_SECRET=cognifyz_task7_super_secret_jwt_key_98765
   WEATHER_API_KEY=your_openweathermap_api_key_here
   ```
   > [!NOTE]
   > If you leave `WEATHER_API_KEY` as `your_openweathermap_api_key_here` or leave it empty, the application will automatically switch to a **Mock Weather service fallback**. This generates realistic and consistent weather data for any searched city name, allowing you to test the registration, search, logs, rate limits, and history features immediately without needing to sign up for an API key.

4. **Launch Server**:
   * **Development Mode** (auto reload):
     ```bash
     npm run dev
     ```
   * **Production Mode**:
     ```bash
     npm start
     ```

5. **Access the Client Dashboard**:
   Open your browser and navigate to:
   ```text
   http://localhost:5000
   ```

---

## API Documentation

All request payloads and response bodies utilize `application/json`. Protected endpoints require a JWT header:
`Authorization: Bearer <token>`

### 1. Authentication Endpoints

#### `POST /api/auth/register`
* **Access**: Public
* **Validation**: Username (>=3 chars), Email format, Password (>=6 chars).
* **Sample Request**:
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
* **Sample Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0MmU...",
    "user": {
      "id": "642e1234567890123456789a",
      "username": "john_doe",
      "email": "john@example.com",
      "createdAt": "2026-06-16T10:00:00.000Z"
    }
  }
  ```

#### `POST /api/auth/login`
* **Access**: Public
* **Validation**: Email must be non-empty, Password must be non-empty.
* **Sample Request**:
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
* **Sample Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0MmU...",
    "user": {
      "id": "642e1234567890123456789a",
      "username": "john_doe",
      "email": "john@example.com",
      "createdAt": "2026-06-16T10:00:00.000Z"
    }
  }
  ```

#### `GET /api/auth/profile`
* **Access**: Private (Requires JWT)
* **Sample Headers**: `Authorization: Bearer eyJhbGciOiJIUzI1Ni...`
* **Sample Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "id": "642e1234567890123456789a",
      "username": "john_doe",
      "email": "john@example.com",
      "createdAt": "2026-06-16T10:00:00.000Z"
    }
  }
  ```

---

### 2. Weather & History Endpoints

All endpoints below require **JWT authentication**.

#### `GET /api/weather/search?city=<city_name>`
* **Access**: Private (Requires JWT)
* **Validation**: `city` query parameter is required.
* **Flow**: Fetches data from OpenWeatherMap (or mock fallback), stores search record under the user's ID in MongoDB, and returns weather details.
* **Sample Request**: `GET /api/weather/search?city=Tokyo`
* **Sample Response (200 OK)**:
  ```json
  {
    "success": true,
    "weather": {
      "temp": 24.5,
      "description": "Clear Sky",
      "humidity": 65,
      "windSpeed": 3.6,
      "icon": "01d",
      "country": "JP",
      "cityName": "Tokyo",
      "isMock": true
    },
    "searchLogId": "642e88888888888888888888"
  }
  ```

#### `GET /api/weather/history`
* **Access**: Private (Requires JWT)
* **Description**: Returns all weather searches made by the authenticated user in descending order (newest first).
* **Sample Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 1,
    "history": [
      {
        "_id": "642e88888888888888888888",
        "userId": "642e1234567890123456789a",
        "query": "Tokyo",
        "weatherData": {
          "temp": 24.5,
          "description": "Clear Sky",
          "humidity": 65,
          "windSpeed": 3.6,
          "icon": "01d",
          "country": "JP"
        },
        "timestamp": "2026-06-16T10:15:30.000Z"
      }
    ]
  }
  ```

#### `DELETE /api/weather/history/:id`
* **Access**: Private (Requires JWT)
* **Description**: Removes a single search history entry by ID. Users can only delete their own history.
* **Sample Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Search history entry removed."
  }
  ```

#### `DELETE /api/weather/history`
* **Access**: Private (Requires JWT)
* **Description**: Deletes all search history records belonging to the authenticated user.
* **Sample Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Cleared search history list. Removed 1 entries."
  }
  ```

---

### 3. Utility / Status Endpoint

#### `GET /api/status`
* **Access**: Public
* **Description**: Check server-side status configurations (local MongoDB connection health and OpenWeatherMap mode configuration).
* **Sample Response (200 OK)**:
  ```json
  {
    "success": true,
    "database": {
      "state": 1,
      "status": "Connected"
    },
    "weatherApiMode": "Mock Fallback Mode (Configurable in .env)"
  }
  ```

---

## Error Handling & Status Codes

All errors are returned in a structured format:
```json
{
  "success": false,
  "message": "Detailed error summary description."
}
```

Common status codes returned:
* `200 OK`: Successful retrieval or deletion.
* `201 Created`: Successful creation (registration).
* `400 Bad Request`: Validation failure or duplicate entries.
* `401 Unauthorized`: Missing, invalid, or expired JWT.
* `403 Forbidden`: Querying or mutating resources belonging to another user.
* `404 Not Found`: City not found or endpoint resource not found.
* `429 Too Many Requests`: Triggered by exceeding rate limiter constraints.
* `500 Internal Server Error`: Global fallback for unhandled exceptions.

---

## Testing Guide

### Option A: Testing with the Dashboard UI (Recommended)
1. Launch the server (`npm run dev`).
2. Go to `http://localhost:5000` in your browser.
3. Open the **API Request Inspector** panel at the bottom (click the terminal button in the footer). This allows you to inspect raw request payloads, JSON response states, and headers in real-time as you interact with the UI.
4. Fill in the **Register Account** form to create a user. The client will store your JWT in local storage.
5. In the weather lookup bar, enter a city name (e.g. "Chicago") or click a suggested city button.
6. Check the weather results layout on the right and trace the MongoDB logs in your search history list on the left.
7. Click the trash icon next to a history item to delete it, or click the "Clear All" button to wipe the history.
8. Click the logout button to clear your session token.

### Option B: Command Line Testing (cURL)

**1. Register User**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "password123"}'
```

**2. Login User (Copy the returned token)**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

**3. Get Profile (Replace `<token>` with returned string)**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer <token>"
```

**4. Search Weather**
```bash
curl -X GET "http://localhost:5000/api/weather/search?city=London" \
  -H "Authorization: Bearer <token>"
```

**5. Get Search History**
```bash
curl -X GET http://localhost:5000/api/weather/history \
  -H "Authorization: Bearer <token>"
```
