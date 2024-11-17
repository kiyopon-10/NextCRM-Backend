const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Campaign = require('../models/Campaign');


// Get total customers
router.get('/total-customers', async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    res.json({ totalCustomers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get total campaigns (assuming you have a Campaign model)
router.get('/total-campaigns', async (req, res) => {
  try {
    const totalCampaigns = await Campaign.countDocuments();
    res.json({ totalCampaigns });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get recent activity (let's fetch the most recent customer order)
router.get('/recent-activity', async (req, res) => {
  try {
    const recentActivity = await Order.find()
      .sort({ date: -1 })
      .limit(1)
      .populate('customer')
      .exec();
    res.json({ recentActivity: recentActivity[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
