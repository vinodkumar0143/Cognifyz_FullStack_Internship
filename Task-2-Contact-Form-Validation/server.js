const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Temporary in-memory array to store contact submissions
const submissions = [];

// Configure Express to use EJS templates
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse form body data (from URL-encoded form submissions)
app.use(express.urlencoded({ extended: true }));

// Serve static assets (CSS, images)
app.use(express.static(path.join(__dirname, 'public')));

// 1. GET Route: Display the contact form
app.get('/', (req, res) => {
  res.render('form', {
    errors: {},
    values: {}
  });
});

// 2. POST Route: Handle form submission and validation
app.post('/submit', (req, res) => {
  const { fullName, email, phone, subject, message } = req.body;
  const errors = {};

  // Simple Server-Side Validation checks

  // Full Name validation (Required, minimum 3 chars, letters and spaces only)
  if (!fullName || fullName.trim().length < 3) {
    errors.fullName = 'Name must be at least 3 characters long.';
  } else if (!/^[a-zA-Z\s]+$/.test(fullName.trim())) {
    errors.fullName = 'Name must contain only letters and spaces.';
  }

  // Email validation (Required, valid format check)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  // Phone validation (Required, exactly 10 digits check)
  if (!phone || !/^\d{10}$/.test(phone.trim())) {
    errors.phone = 'Phone number must be exactly 10 digits.';
  }

  // Subject validation (Required, minimum 5 chars)
  if (!subject || subject.trim().length < 5) {
    errors.subject = 'Subject must be at least 5 characters long.';
  }

  // Message validation (Required, minimum 15 chars)
  if (!message || message.trim().length < 15) {
    errors.message = 'Message must be at least 15 characters long.';
  }

  // If there are validation errors, re-render the form and display messages
  if (Object.keys(errors).length > 0) {
    return res.status(400).render('form', {
      errors: errors,
      values: req.body
    });
  }

  // Save successful submission in memory
  const newSubmission = {
    id: submissions.length + 1,
    fullName: fullName.trim(),
    email: email.trim(),
    phone: phone.trim(),
    subject: subject.trim(),
    message: message.trim(),
    submittedAt: new Date().toLocaleString()
  };
  
  submissions.push(newSubmission);

  // Directly render the success page passing the current and all stored submissions
  res.render('success', {
    current: newSubmission,
    allSubmissions: submissions
  });
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
