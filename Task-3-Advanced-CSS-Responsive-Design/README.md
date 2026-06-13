# Task 3: Advanced CSS Styling and Responsive Design

A fully responsive, multi-section landing page built using **HTML5**, **Advanced CSS3**, and **Bootstrap 5** grid utilities. Designed to demonstrate fluid layout shifts, glassmorphic UI components, and micro-interactions.

---

## 📂 Folder Structure

```text
Task-3-Advanced-CSS-Responsive-Design/
├── css/
│   └── style.css            # Typography, CSS variables, resets, and animations
├── js/
│   └── main.js              # Navbar scroll toggles & scroll-animate observers
├── screenshots/             # Layout screen captures
│   ├── hero_section.png
│   ├── about_section.png
│   ├── services_section.png
│   └── contact_section.png
├── index.html               # Semantic HTML layout linked with Bootstrap 5 CDN
└── README.md                # Submission guides and execution steps
```

---

## 🛠️ Technology Stack
* **HTML5:** Standard semantic tags (`<header>`, `<nav>`, `<section>`, `<footer>`) to construct the layout.
* **CSS3 (Advanced):** Custom variables, hover transforms, keyframe transitions, backdrop blur filters, and clamp text ratios.
* **Bootstrap 5 (Grid & Utilities):** CDN link inclusion to control breakpoints, columns, and mobile hamburger navbar toggles.
* **Vanilla JavaScript:** Light Scroll Observer to trigger fade-in animations on viewport entry.

---

## 📦 Page Sections & Purpose

1. **Responsive Navbar:** Sticky top header that changes transparency to blurred slate upon scroll. Integrates mobile expand toggles.
2. **Hero Section:** High-impact bold display area with gradient typographic titles, action CTAs, and a floating geometric vector.
3. **About Section:** Two-column grid showing corporate stats, descriptors, and design tokens cards.
4. **Services Section:** Grid of 3D hover-sensitive services cards with icon transitions.
5. **Features Section:** Accordion/box list of technical achievements.
6. **Contact Section:** Clean office coordinate lists paired with a glassmorphic response form.
7. **Footer:** Quick index links and news subscription input.

---

## ⚙️ Running Locally

Since this is a static frontend-only project, it requires **no backend server setup**.
1. Open the [Task-3-Advanced-CSS-Responsive-Design](file:///c:/Users/vinod/OneDrive/Desktop/Cognifyz-FullStack-Internship/Task-3-Advanced-CSS-Responsive-Design) folder.
2. Double-click the `index.html` file to launch the page directly in your web browser.

---

## 🧪 Testing Checklist
- [ ] **Navbar Sticky Scroll:** Scroll down and check if the navbar backdrop changes to blurred.
- [ ] **Section Active states:** Scroll through sections and verify if navbar links highlight active tags dynamically.
- [ ] **Desktop Grid (>= 992px):** Ensure hero elements and columns are side-by-side.
- [ ] **Tablet Grid (768px - 991px):** Resize browser to check if elements adapt or wrap neatly.
- [ ] **Mobile Grid (< 768px):** Verify full 1-column vertical stack order and center alignment.
- [ ] **Hamburger menu toggle:** Toggle mobile navbar button to ensure dropdown opens/closes correctly.
- [ ] **Hover animations:** Hover over service cards to check if they float upward (`translateY`) and glow.
- [ ] **Focus highlights:** Select contact form input fields to verify glow outlines.

---

## 📸 Screenshot Checklist
Captured and saved inside the `screenshots/` directory:
- [x] `hero_section.png` — Desktop layout showing Hero and Navbar.
- [x] `about_section.png` — Grid metrics, description, and dual-layer compliance.
- [x] `services_section.png` — Core competencies cards with modern hover scaling and micro-animations.
- [x] `contact_section.png` — Glassmorphic contact form and office coordinates.

---

## 🚀 GitHub Submission Checklist
- [ ] Ensure all code files are situated strictly inside the `Task-3-Advanced-CSS-Responsive-Design` directory.
- [ ] Check that no files in `Task-1` or `Task-2` are modified or deleted.
- [ ] Open Git console and run `git add Task-3-Advanced-CSS-Responsive-Design`.
- [ ] Commit changes with message `git commit -m "completed task3 contact form validation"`.
- [ ] Push changes to remote: `git push origin main`.
