const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport')

require('./config/passport');

dotenv.config();

const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Configure sessions for authentication
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,  // Set to false in development (use true in production with https)
      httpOnly: true,  // Helps prevent cross-site scripting (XSS) attacks
      sameSite: 'lax'  // SameSite 'lax' is generally sufficient in most cases
    }
  }));
  

app.use(passport.initialize());
app.use(passport.session());

// Define authentication routes
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// Middleware to check if user is authenticated
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    console.log('User is not authenticated. Redirecting to login.');
    res.redirect('http://localhost:5173/login');  // This could redirect to the login page
};

// Routes with authentication requirement
app.use('/api/dashboard', ensureAuthenticated, require('./routes/dashboardRoutes'));
app.use('/api/data', ensureAuthenticated, require('./routes/dataRoutes'));
app.use('/api/audience', ensureAuthenticated, require('./routes/audienceRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
