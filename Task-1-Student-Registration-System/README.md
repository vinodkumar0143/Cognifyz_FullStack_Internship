# Task 1: Student Registration System

A modern, responsive, and robust **Student Registration System** built with **Node.js**, **Express.js**, and **EJS** (Embedded JavaScript templates) for server-side rendering, styled with professional glassmorphism aesthetics.

This is the first task of the **Cognifyz Full Stack Development Internship**.

---

## 🚀 Key Features

* **Server-Side Rendering (SSR)**: Dynamic page delivery using EJS.
* **Aesthetic CSS Architecture**: Responsive UI themed with premium colors (indigo & teal), subtle shadows, hover transformations, focus rings, and custom Google Fonts (`Outfit` + `Plus Jakarta Sans`).
* **Input Fields**:
  * Full Name
  * Email Address
  * Mobile Number (10 digits validation)
  * College Name
  * Course Selection
* **Robust Input Validation**: Multi-layer form validations checking for matching formats, empty strings, and regex-valid inputs. 
* **Dynamic Details Presentation**: Successful registration prompts an dynamic success card rendering the complete processed invoice profile with randomly assigned Registration ID and timestamps.

---

## 📁 Directory Structure

```text
Task-1-Student-Registration-System/
├── public/
│   └── css/
│       └── style.css          # Premium style rules (CSS Variables, responsive grid)
├── views/
│   ├── index.ejs              # Main registration form page with validation alerts
│   └── success.ejs            # Invoice layout presenting registration summary
├── server.js                  # Express app, parsing middlewares, and router paths
├── package.json               # Dependencies (express, ejs, nodemon)
└── README.md                  # This file
```

---

## 🛠️ Installation & Setup

Ensure you have [Node.js](https://nodejs.org/) installed on your workstation.

1. **Navigate to the Task 1 directory**:
   ```bash
   cd Task-1-Student-Registration-System
   ```

2. **Install Node dependencies**:
   This installs Express, EJS, and Nodemon:
   ```bash
   npm install
   ```

---

## 🏃 Running the Application

### Option A: Standard Production Mode
```bash
npm start
```
Starts the server at `http://localhost:3000` using Node.js directly.

### Option B: Developer Hot-Reloading Mode
```bash
npm run dev
```
Starts the server with Nodemon, which dynamically restarts the app whenever backend code or EJS templates are edited.

---

## 🧪 Testing Instructions

1. Run the server using `npm start` or `npm run dev`.
2. Open your web browser and navigate to: **[http://localhost:3000](http://localhost:3000)**.
3. Test **Server Validation** by clicking **Complete Registration** without filling out the inputs, or inputting invalid formats. Validate that warning labels display correctly.
4. Fill out the form with correct entries:
   * **Full Name**: John Doe
   * **Email**: john.doe@university.edu
   * **Mobile Number**: 9876543210
   * **College**: Stanford University
   * **Course**: Choose one from the dropdown (e.g. Full-Stack Web Development)
5. Click **Complete Registration**.
6. Check that you are routed to the **Registration Successful** screen displaying the details, registration timestamp, and dynamically generated Registration ID.
7. Click **Register Another Student** to navigate back and clear state.
