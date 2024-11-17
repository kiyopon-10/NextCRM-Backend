const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.send'],
  accessType: 'offline',
  prompt: 'consent'
}));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    console.log("Authenticated user:", req.user);
    res.redirect('http://localhost:5173'); // Redirect to the Home after login
  }
);

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
  
      res.clearCookie('connect.sid');
      
      res.json({ message: 'Successfully logged out' });
    });
  });

// Route to check authentication status
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ isAuthenticated: true, user: req.user });
  } else {
    res.json({ isAuthenticated: false, user: null });
  }
});

module.exports = router;
