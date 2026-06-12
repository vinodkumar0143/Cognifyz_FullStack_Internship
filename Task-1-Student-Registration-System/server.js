/**
 * Task 1: Student Registration System
 * server.js - Simple Express Server
 */

const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Set EJS as the view/template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse form data sent from HTML forms
app.use(express.urlencoded({ extended: true }));

// Middleware to serve static files like CSS from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Route 1: GET / - Displays the registration form
app.get('/', (req, res) => {
    res.render('index');
});

// Route 2: POST /register - Handles the form submission
app.post('/register', (req, res) => {
    // Get form data submitted by the user
    const fullName = req.body.fullName;
    const email = req.body.email;
    const mobile = req.body.mobile;
    const college = req.body.college;
    const course = req.body.course;

    // Send this data to the success page to display it dynamically
    res.render('success', {
        fullName: fullName,
        email: email,
        mobile: mobile,
        college: college,
        course: course
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});

