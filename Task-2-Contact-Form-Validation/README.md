# Task 2: Contact Form Validation System

A modern, responsive, and secure Contact Form Web Application featuring **Dual-Layer Validation** (Client-side & Server-side). Built as part of the Cognifyz Full-Stack Web Development Internship.

---

## 🎯 Project Objectives
1. **Premium Interface:** Build an elegant, responsive contact form utilizing modern dark glassmorphism aesthetics.
2. **Client-Side Validation (Speed/UX):** Implement instantaneous inline input checking using Vanilla JavaScript to guide the user.
3. **Server-Side Validation (Security):** Create an Express.js validation middleware layer to inspect and sanitize data before storage.
4. **Data Management:** Store valid submissions temporarily in-memory inside the Node/Express server runtime.
5. **Success Rendering:** Direct successfully validated submissions to a dynamic success template showcasing a summary and server logs.

---

## 💻 Tech Stack
- **Frontend:** HTML5 (Semantic Structure), CSS3 (Modern Responsive Variable-driven Styles), Vanilla JavaScript (DOM manipulation & client validation).
- **Backend:** Node.js, Express.js (HTTP Routing, JSON/URL-encoded Body parsing, Custom validation middlewares).
- **Template Engine:** EJS (Embedded JavaScript) for dynamic view rendering.
- **Development Tools:** `nodemon` (Hot reloading for server scripts).

---

## 📂 Project Directory Structure

```text
Task-2-Contact-Form-Validation/
├── public/                     # Static files directory
│   └── css/
│       └── style.css           # Premium glassmorphic styles with state variables
├── views/                      # Template folder
│   ├── form.ejs                # Form page (with embedded inline JS validation)
│   └── success.ejs             # Confirmation page and entries table template
├── screenshots/                # Documentation screenshots
│   └── placeholder.txt         # Capturing guidelines
├── server.js                   # Express application and server logic
├── package.json                # Project script list and dependencies
└── README.md                   # Setup instruction guide
```

---

## 🛡️ Validation Rules

| Input Field | Validation Criteria | Error Message |
| :--- | :--- | :--- |
| **Full Name** | Must be 3–50 characters. Letters and spaces only. | *"Name must be at least 3 characters long and contain only letters and spaces."* |
| **Email** | Valid RFC-compliant email address pattern. | *"Please enter a valid email address (e.g., user@example.com)."* |
| **Phone Number** | Exactly 10 digits. Numeric characters only. | *"Phone number must be exactly 10 digits."* |
| **Subject** | Must be between 5 and 100 characters. | *"Subject must be at least 5 characters long."* |
| **Message** | Must be between 15 and 1000 characters. | *"Message must be at least 15 characters long."* |

---

## ⚙️ Installation & Setup

Follow these steps to run the application locally:

### 1. Prerequisite
Ensure that you have [Node.js](https://nodejs.org/) installed on your machine.

### 2. Install Dependencies
Navigate to the directory and run npm install:
```bash
cd Task-2-Contact-Form-Validation
npm install
```

### 3. Run Development Server
Start the Express server using the nodemon hot-reload script:
```bash
npm run dev
```
The server will initialize on: `http://localhost:3000`

---

## 🧪 Testing Validation

### Client-Side Validation Testing
1. Load `http://localhost:3000`.
2. Move through input fields without typing anything and press `Tab` (blur state). Instant validation errors will display underneath inputs.
3. Try typing single characters in "Name" or "Message". The validator checks inputs in real-time once the input field has been blurred once.
4. Hit "Send Message" with unfilled inputs. Submission is blocked and the first erroneous input is focused automatically.

### Server-Side Validation Testing (Bypass Client JS)
1. Open Developer Tools in your browser (`F12`).
2. Go to **Settings** -> **Preferences** -> **Debugger** -> check **Disable JavaScript** (or paste `document.getElementById('contactForm').novalidate = true` in console to skip client HTML checks, then override JS using code-injection).
3. Submit invalid data (e.g. invalid phone number).
4. The server interceptor will reject the form with a `400 Bad Request` status, re-rendering the contact page with error summaries and retaining your typed valid fields.
