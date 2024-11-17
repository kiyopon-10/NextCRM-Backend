const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// Get count of high-value customers
router.get('/segments/high-value', async (req, res) => {
  try {
    const count = await Customer.countDocuments({ totalSpending: { $gt: 10000 } });
    res.json({ count });
  } catch (error) {
    console.error('Error fetching high-value customers:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get count of loyal customers with low visit frequency
router.get('/segments/loyal-low-frequency', async (req, res) => {
  try {
    const count = await Customer.countDocuments({ 
      totalSpending: { $gt: 10000 },
      numberOfVisits: { $lte: 3 }
    });
    res.json({ count });
  } catch (error) {
    console.error('Error fetching loyal low-frequency customers:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get count of dormant customers (no visit in last 3 months)
router.get('/segments/dormant', async (req, res) => {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  try {
    const count = await Customer.countDocuments({ lastVisit: { $lt: threeMonthsAgo } });
    res.json({ count });
  } catch (error) {
    console.error('Error fetching dormant customers:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get count of new customers (signed up within the last month)
router.get('/segments/new-customers', async (req, res) => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  try {
    const count = await Customer.countDocuments({ createdAt: { $gte: oneMonthAgo } });
    res.json({ count });
  } catch (error) {
    console.error('Error fetching new customers:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
