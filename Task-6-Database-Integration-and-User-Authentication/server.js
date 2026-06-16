/**
 * Task 6: Database Integration & User Authentication
 * server.js - Express server with Session Security and MongoDB Mongoose Integration
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('./db');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 6001;

// Fallback JSON database file paths
const FALLBACK_DB = path.join(__dirname, 'data', 'users.json');

// Ensure fallback db directory and file exist
if (!fs.existsSync(path.dirname(FALLBACK_DB))) {
    fs.mkdirSync(path.dirname(FALLBACK_DB), { recursive: true });
}
if (!fs.existsSync(FALLBACK_DB)) {
    fs.writeFileSync(FALLBACK_DB, JSON.stringify([], null, 2), 'utf8');
}

// Middleware for parsing requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static resources from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Configure sessions middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'cognifyz_session_secure_key_12345',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 2, // 2 hours
        secure: false, // set to true in production with HTTPS
        httpOnly: true // helps protect against XSS
    }
}));

// MongoDB Connection State
let dbConnected = false;
let dbErrorMsg = '';

// Monitor connection events from db.js
mongoose.connection.on('connected', () => {
    console.log('Successfully connected to MongoDB.');
    dbConnected = true;
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection failure:', err.message);
    dbErrorMsg = err.message;
    dbConnected = false;
});

mongoose.connection.on('disconnected', () => {
    dbConnected = false;
});

// Sync connection status if already open
if (mongoose.connection.readyState === 1) {
    dbConnected = true;
}

// API endpoint to retrieve Database status
app.get('/api/db-status', (req, res) => {
    res.json({
        connected: dbConnected,
        fallbackMode: !dbConnected,
        message: dbConnected 
            ? 'Connected to local MongoDB database.' 
            : 'MongoDB disconnected. Operating in Local JSON File Database fallback mode.'
    });
});

// JSON fallback read/write helpers
function readFallbackUsers() {
    try {
        const data = fs.readFileSync(FALLBACK_DB, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

function writeFallbackUsers(users) {
    try {
        fs.writeFileSync(FALLBACK_DB, JSON.stringify(users, null, 2), 'utf8');
        return true;
    } catch (err) {
        return false;
    }
}

// Authentication and Authorization Middleware
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Access denied. Please login to view this content.' });
    }
    next();
}

function requireRole(role) {
    return (req, res, next) => {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Access denied. Please login.' });
        }
        if (req.session.userRole !== role) {
            return res.status(403).json({ message: `Access denied. Requires '${role}' privilege level.` });
        }
        next();
    };
}

// --- SECURED & AUTHENTICATION ENDPOINTS ---

// 1. POST /api/auth/register - Register a new User
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Perform validation
        if (!username || username.trim().length < 3) {
            return res.status(400).json({ message: 'Username must be at least 3 characters.' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email.trim())) {
            return res.status(400).json({ message: 'Please enter a valid email address.' });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }

        const userRole = role === 'admin' ? 'admin' : 'user';

        if (dbConnected) {
            // MongoDB Path
            const userExists = await User.findOne({ 
                $or: [
                    { email: email.toLowerCase() },
                    { username: username.toLowerCase() }
                ] 
            });

            if (userExists) {
                if (userExists.email === email.toLowerCase()) {
                    return res.status(400).json({ message: 'Email address is already registered.' });
                }
                return res.status(400).json({ message: 'Username is already taken.' });
            }

            const newUser = new User({
                username: username.trim(),
                email: email.trim().toLowerCase(),
                password: password,
                role: userRole
            });

            await newUser.save();

            res.status(201).json({
                message: 'User registered successfully to MongoDB. You can now login.',
                user: { username: newUser.username, email: newUser.email, role: newUser.role }
            });
        } else {
            // Local JSON Fallback Path
            const users = readFallbackUsers();
            
            const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
            const usernameExists = users.some(u => u.username.toLowerCase() === username.toLowerCase());

            if (emailExists) {
                return res.status(400).json({ message: 'Email address is already registered.' });
            }
            if (usernameExists) {
                return res.status(400).json({ message: 'Username is already taken.' });
            }

            // Hash password securely with bcryptjs
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = {
                id: Date.now().toString(),
                username: username.trim(),
                email: email.trim().toLowerCase(),
                password: hashedPassword,
                role: userRole,
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            writeFallbackUsers(users);

            res.status(201).json({
                message: 'User registered successfully (Local fallback store). You can now login.',
                user: { username: newUser.username, email: newUser.email, role: newUser.role }
            });
        }
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Internal server error occurred during registration.' });
    }
});

// 2. POST /api/auth/login - User login and session initialization
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        if (dbConnected) {
            // MongoDB Path
            const user = await User.findOne({ email: email.toLowerCase() });
            if (!user) {
                return res.status(401).json({ message: 'Invalid email address or password.' });
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid email address or password.' });
            }

            // Set session variables
            req.session.userId = user._id;
            req.session.username = user.username;
            req.session.userRole = user.role;
            req.session.email = user.email;

            res.json({
                message: 'Logged in successfully to MongoDB.',
                user: { username: user.username, email: user.email, role: user.role }
            });
        } else {
            // Local JSON Fallback Path
            const users = readFallbackUsers();
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

            if (!user) {
                return res.status(401).json({ message: 'Invalid email address or password.' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid email address or password.' });
            }

            // Set session variables
            req.session.userId = user.id;
            req.session.username = user.username;
            req.session.userRole = user.role;
            req.session.email = user.email;

            res.json({
                message: 'Logged in successfully (Local fallback store).',
                user: { username: user.username, email: user.email, role: user.role }
            });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Internal server error occurred during login.' });
    }
});

// 3. POST /api/auth/logout - Terminate session
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Failed to destroy session.' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully.' });
    });
});

// 4. GET /api/auth/me - Verify session state and fetch current user profile
app.get('/api/auth/me', async (req, res) => {
    if (!req.session.userId) {
        return res.status(200).json({ authenticated: false });
    }

    try {
        if (dbConnected) {
            const user = await User.findById(req.session.userId).select('-password');
            if (!user) {
                req.session.destroy();
                return res.status(200).json({ authenticated: false });
            }
            res.json({
                authenticated: true,
                user: { username: user.username, email: user.email, role: user.role }
            });
        } else {
            const users = readFallbackUsers();
            const user = users.find(u => u.id === req.session.userId);
            if (!user) {
                req.session.destroy();
                return res.status(200).json({ authenticated: false });
            }
            res.json({
                authenticated: true,
                user: { username: user.username, email: user.email, role: user.role }
            });
        }
    } catch (err) {
        res.status(500).json({ message: 'Failed to verify session profile.' });
    }
});

// --- PROTECTED DATA ENDPOINTS ---

// 5. GET /api/data/protected - Available to any authenticated user
app.get('/api/data/protected', requireAuth, (req, res) => {
    res.json({
        securityLevel: 'High',
        accessGranted: true,
        requester: req.session.username,
        secretMessage: 'This message is retrieved from a protected API route (requireAuth). Only authenticated users can see this.',
        serverTimestamp: new Date().toISOString(),
        mockSecureData: [
            { id: 101, codeName: 'Project Ares', budget: '$2.4M', status: 'In Progress' },
            { id: 102, codeName: 'Project Hyperion', budget: '$1.8M', status: 'Planning' }
        ]
    });
});

// 6. GET /api/data/admin - Access restricted to authenticated users with 'admin' role
app.get('/api/data/admin', requireRole('admin'), (req, res) => {
    res.json({
        securityLevel: 'Critical (Admin-Only)',
        accessGranted: true,
        requester: req.session.username,
        secretMessage: 'Welcome to the Admin Dashboard API. Access has been authorized via the requireRole("admin") check.',
        serverTimestamp: new Date().toISOString(),
        systemMetrics: {
            uptime: `${Math.round(process.uptime())} seconds`,
            memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
            dbConnectionStatus: dbConnected ? 'Connected (MongoDB)' : 'Disconnected (JSON Fallback DB Active)',
            totalUsersCount: dbConnected ? 'Query active' : 'Offline'
        }
    });
});

// Serve the index.html fallback for other queries
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start listening
app.listen(PORT, () => {
    console.log(`Task 6 Authentication Server running at http://localhost:${PORT}`);
});
