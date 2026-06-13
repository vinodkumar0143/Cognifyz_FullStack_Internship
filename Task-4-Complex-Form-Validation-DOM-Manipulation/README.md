# Task 4: Complex Form Validation & Dynamic DOM Manipulation

Welcome to the **Task 4: Complex Form Validation & Dynamic DOM Manipulation** workspace, completed as part of the Cognifyz Full-Stack Developer Internship. 

This is a modern, responsive **Single Page Application (SPA)** that handles client-side form validation in real-time, displays password complexity meters, manages user registration state inside the client, and offers a real-time list dashboard with live search filtering and animated entry/exit updates.

---

## 📂 Folder Structure

```text
Task-4-Complex-Form-Validation-DOM-Manipulation/
├── css/
│   └── style.css       # Layout variables, animations, custom validation icons, and strength meter
├── js/
│   └── main.js         # Single-page routing, form validation algorithms, DOM builders, local storage sync
├── screenshots/        # App screenshot captures
│   ├── 01-home-section.png
│   ├── 02-registration-validation-success.png
│   ├── 03-registration-validation-errors.png
│   └── 04-submitted-users.png
├── index.html          # SPA markup containing navbar, 3 route sections, forms, and CDN scripts
└── README.md           # This documentation file
```

---

## ⚡ Architectural Design

1. **Vanilla Single Page Application (SPA)**: Routing is managed entirely on the client side using window hashes (`#home`, `#register`, `#users`). Transition styles in `css/style.css` reveal active sections smoothly with fade-in and scale animations.
2. **Persistent Mock Database**: Submitted user registration items are compiled into structured data objects and saved inside `localStorage`. Reloading the page will keep the list populated.
3. **Advanced CSS Styling**: Using **Outfit** typography from Google Fonts, custom CSS custom properties (variables), subtle glassmorphism cards, and shadow pulses to create a premium aesthetic.

---

## 🧪 Form Validation Rules

Validation rules trigger live on both input change (`input`) and focus loss (`blur`):

*   **Full Name**: Must be at least 2 characters, consisting only of letters and spacing.
*   **Email Address**: Validated against standard RFC 5322 regex validation rules.
*   **Phone Number**: Must contain exactly 10 digits.
*   **Age Limit**: Minimum age of 18 is enforced by calculating birth date input details dynamically against the system clock.
*   **Password Strength Heuristics**: Calculates complexity using a 5-point score:
    *   Length $\ge 8$ characters
    *   At least one uppercase letter
    *   At least one lowercase letter
    *   At least one numeric digit
    *   At least one special character
    *   *Resulting strengths:* **Weak** (Red, 0-2 score), **Medium** (Orange/Yellow, 3-4 score), **Strong** (Green, 5/5 score).
*   **Confirm Password**: Evaluated live for character equivalence against the password field.

---

## 💻 Running the Application Locally

Since this project uses **HTML, CSS, Bootstrap, and Vanilla JavaScript only**, there is no backend database setup, Node.js installation, or compilation step required.

### Option A: Direct Browser Launch
1. Double-click the `index.html` file inside this directory to open it in any modern web browser.

### Option B: Local Web Server (Recommended)
1. Run a lightweight local HTTP server from this directory. For example, if you have Python installed, execute the following command in your terminal:
   ```bash
   python -m http.server 8000
   ```
2. Open your web browser and navigate to `http://localhost:8000`.

---

## 🛠️ Verification & Testing Scenarios

1.  **SPA Routing Verification**: Click the Navigation links (`Home`, `Register Form`, `Submitted Users`). The URL hash should change, and sections should transition in smoothly.
2.  **Live Validation Interactivity**: Type invalid data into any input field. Notice the input box outline glow red with descriptive helper error text. Correct the inputs and check that it dynamically converts to a green boundary with a check icon.
3.  **Password Strength Meter**: Type a simple password (e.g. `pass1`). Observe the red progress indicator showing "Weak". Add letters, capitals, numbers, and symbols to observe the bar transition through "Medium" and "Strong".
4.  **Submission and Redirection Flow**: Fill out all fields correctly and press **Register Account**. Verify that the success toast appears, the form resets, and you are automatically transitioned to the `Submitted Users` section.
5.  **Dashboard Filtering & Mutability**: Type parts of names or emails inside the dashboard search bar. Notice that only matched items display. Click the **Delete** button to remove a user card, observing the smooth fade-out collapse.

---

## 📸 Screenshot Checklist
Captured and saved inside the `screenshots/` directory:
- [x] `01-home-section.png` — Main landing screen with hero section.
- [x] `02-registration-validation-success.png` — Live registration form with successful field validation checks.
- [x] `03-registration-validation-errors.png` — Live validation showing constraint errors (e.g., age limit & phone digits).
- [x] `04-submitted-users.png` — Submitted users dashboard with local storage persistence and delete functionality.

