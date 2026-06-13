# Task 5: API Integration & Front-End Interaction

Welcome to the **Task 5: API Integration & Front-End Interaction** workspace, completed as part of the Cognifyz Full-Stack Developer Internship.

This is a modern, responsive **User Directory Dashboard** powered by a Node.js + Express backend and a premium, glassmorphic single-page frontend. It connects to a RESTful JSON database on the server and provides full Create, Read, Update, and Delete (CRUD) operations asynchronously without page refreshes.

---

## 📂 Folder Structure

```text
Task-5-API-Integration-Front-End-Interaction/
├── data/
│   └── users.json         # Server-side JSON database store
├── public/
│   ├── css/
│   │   └── style.css      # Glassmorphic layout variables, layout rules, animations
│   ├── js/
│   │   └── app.js         # Single-page controller, asynchronous Fetch calls, client validations
│   └── index.html         # Main dashboard markup, modals, stat widgets, and CDNs
├── screenshots/           # Directory for application screenshots and video demos
│   └── demo_recording.mp4 # CRUD operation video demonstration
├── package.json           # Project configurations and start commands
├── server.js              # Express REST server configuration and endpoint routes
└── README.md              # Detailed project documentation
```

---

## ⚡ Architectural Design & Tech Stack

1. **RESTful Architecture**: Client-side interactions communicate asynchronously with the backend server via structured JSON endpoints.
2. **Persistence Layer**: Data is persisted on disk inside a local JSON file (`data/users.json`), ensuring mock user profiles are preserved across server restarts.
3. **Advanced Frontend Logic**: Uses `async/await` Fetch API blocks with visual skeleton screens, button spinners, dynamic avatar builders, and custom toast notification elements.
4. **Responsive Glassmorphic UI**: Styled using vanilla CSS properties (variables), Outfit typography from Google Fonts, FontAwesome icons, and slide-up card rendering animations.

---

## 🛠️ API Endpoints

The Express backend exposes the following RESTful endpoints:

| Method | Endpoint | Description | Request Body | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/users` | Retrieve all users | *None* | `200 OK` (JSON array) |
| **GET** | `/api/users/:id` | Retrieve single user details | *None* | `200 OK` / `404 Not Found` |
| **POST** | `/api/users` | Create a new user profile | User object (validated) | `201 Created` / `400 Bad Request` |
| **PUT** | `/api/users/:id` | Update an existing user profile | User object (validated) | `200 OK` / `400 Bad Request` / `404` |
| **DELETE** | `/api/users/:id` | Remove a user profile | *None* | `200 OK` / `404 Not Found` |

---

## 💻 Running the Application Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### Installation Steps
1. Navigate into the Task 5 directory:
   ```bash
   cd Task-5-API-Integration-Front-End-Interaction
   ```
2. Install the necessary dependencies (Express and Nodemon):
   ```bash
   npm install
   ```
3. Start the application server:
   ```bash
   npm start
   ```
4. Open your web browser and navigate to: **[http://localhost:5000](http://localhost:5000)**

---

## 🎥 Video Demonstration
A complete video walk-through demonstrating all user CRUD operations, validations, status changes, and analytics calculations in real-time is saved inside:
* **[demo_recording.mp4](screenshots/demo_recording.mp4)**

---

## 🎓 Learning Outcomes

Through this task, I successfully implemented and mastered:
* **Asynchronous REST API Integration**: Learned how to construct Express middleware, parse incoming bodies, write robust server-side routing, and enforce strict status code conventions (`200`, `201`, `400`, `404`, `500`).
* **Non-Blocking Client Communications**: Leveraged `async/await` and the Fetch API to make client updates fast, fluid, and completely reload-free.
* **Persistent Local Database Modeling**: Managed file stream readers (`fs.readFileSync`/`fs.writeFileSync`) to write a structured file-based persistence model.
* **Complex Data Binding & Form Controls**: Constructed real-time analytics calculators (total counts, status distributions, age averages) that adjust as users are added or removed dynamically.
