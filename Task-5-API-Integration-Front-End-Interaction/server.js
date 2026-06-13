/**
 * Task 5: API Integration & Front-End Interaction
 * server.js - RESTful Express API Server
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

const DATA_FILE = path.join(__dirname, 'data', 'users.json');

// Ensure database directory and file exist
if (!fs.existsSync(path.dirname(DATA_FILE))) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf8');
}

// Helper functions to read/write JSON database
function getUsers() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading user data:', err);
        return [];
    }
}

function saveUsers(users) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('Error saving user data:', err);
        return false;
    }
}

// Helper function to validate user data
function validateUser(userData, isUpdate = false) {
    const errors = {};
    const { fullName, email, phone, dob, role, status } = userData;

    // Full Name validation
    if (!fullName || fullName.trim().length < 2) {
        errors.fullName = 'Full Name must be at least 2 characters long.';
    } else if (!/^[a-zA-Z\s]+$/.test(fullName.trim())) {
        errors.fullName = 'Full Name must contain only letters and spaces.';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
        errors.email = 'Please enter a valid email address.';
    }

    // Phone validation
    if (!phone || !/^\d{10}$/.test(phone.trim())) {
        errors.phone = 'Phone number must be exactly 10 digits.';
    }

    // Date of Birth validation (minimum age of 18)
    if (!dob) {
        errors.dob = 'Date of birth is required.';
    } else {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (isNaN(age) || age < 18) {
            errors.dob = `You must be at least 18 years old. (Current age: ${isNaN(age) ? 0 : age})`;
        }
    }

    // Role validation
    const validRoles = ['Developer', 'Designer', 'Manager', 'Analyst'];
    if (!role || !validRoles.includes(role)) {
        errors.role = 'Please select a valid role.';
    }

    // Status validation
    const validStatuses = ['Active', 'Suspended'];
    if (!status || !validStatuses.includes(status)) {
        errors.status = 'Please select a valid status.';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- REST API ENDPOINTS ---

// 1. GET /api/users - Retrieve all users
app.get('/api/users', (req, res) => {
    const users = getUsers();
    res.json(users);
});

// 2. GET /api/users/:id - Retrieve a single user by ID
app.get('/api/users/:id', (req, res) => {
    const users = getUsers();
    const user = users.find(u => u.id === req.params.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
});

// 3. POST /api/users - Create a new user
app.post('/api/users', (req, res) => {
    const validation = validateUser(req.body);
    if (!validation.isValid) {
        return res.status(400).json({ errors: validation.errors });
    }

    const users = getUsers();
    
    // Check for email uniqueness
    const emailExists = users.some(u => u.email.toLowerCase() === req.body.email.toLowerCase());
    if (emailExists) {
        return res.status(400).json({ errors: { email: 'Email address is already registered.' } });
    }

    const newUser = {
        id: Date.now().toString(), // simple unique string ID
        fullName: req.body.fullName.trim(),
        email: req.body.email.trim().toLowerCase(),
        phone: req.body.phone.trim(),
        dob: req.body.dob,
        role: req.body.role,
        status: req.body.status,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    if (saveUsers(users)) {
        res.status(201).json(newUser);
    } else {
        res.status(500).json({ message: 'Failed to write user to database.' });
    }
});

// 4. PUT /api/users/:id - Update an existing user
app.put('/api/users/:id', (req, res) => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === req.params.id);
    
    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found.' });
    }

    const validation = validateUser(req.body, true);
    if (!validation.isValid) {
        return res.status(400).json({ errors: validation.errors });
    }

    // Check for email uniqueness (excluding the current user being edited)
    const emailExists = users.some(u => u.id !== req.params.id && u.email.toLowerCase() === req.body.email.toLowerCase());
    if (emailExists) {
        return res.status(400).json({ errors: { email: 'Email address is already in use by another user.' } });
    }

    const updatedUser = {
        ...users[userIndex],
        fullName: req.body.fullName.trim(),
        email: req.body.email.trim().toLowerCase(),
        phone: req.body.phone.trim(),
        dob: req.body.dob,
        role: req.body.role,
        status: req.body.status,
        updatedAt: new Date().toISOString()
    };

    users[userIndex] = updatedUser;
    if (saveUsers(users)) {
        res.json(updatedUser);
    } else {
        res.status(500).json({ message: 'Failed to update user in database.' });
    }
});

// 5. DELETE /api/users/:id - Delete a user
app.delete('/api/users/:id', (req, res) => {
    const users = getUsers();
    const userExists = users.some(u => u.id === req.params.id);
    
    if (!userExists) {
        return res.status(404).json({ message: 'User not found.' });
    }

    const filteredUsers = users.filter(u => u.id !== req.params.id);
    if (saveUsers(filteredUsers)) {
        res.json({ success: true, message: 'User deleted successfully.' });
    } else {
        res.status(500).json({ message: 'Failed to delete user.' });
    }
});

// Handle serving the frontend single-page file for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Task 5 Server running at http://localhost:${PORT}`);
});
