const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Campaign = require('../models/Campaign');
const CommunicationLog = require('../models/CommunicationLog')
const { sendEmail } = require('../utils/emailSender');

//----------------------------------------------------------------------------------------------------------------------------

// Dummy function to simulate the delivery receipt update
const updateDeliveryStatus = async (logId) => {
  const status = Math.random() < 0.9 ? 'SENT' : 'FAILED';

  await CommunicationLog.findByIdAndUpdate(logId, { status });

  console.log(`Delivery status for logId ${logId}: ${status}`);
};

// Route to create a new campaign with audience criteria
router.post('/create-campaign', async (req, res) => {
  const { name, description, targetAudience } = req.body;

  try {
    const campaign = new Campaign({
      name,
      description,
      targetAudience,
    });

    // Get target audience based on the criteria in the campaign
    const audience = await campaign.getTargetAudience();

    campaign.members = audience.length;

    await campaign.save();

    // Loop through each customer in the target audience and send personalized email
    for (const customer of audience) {
      const message = `Hi ${customer.name},\n\n
        We are glad to announce that you are a part of our special campaign called "${campaign.name}".\n
        You will receive the following benefit: ${campaign.description}.\n\n
        Greetings,\n
        Team NextCRM`;


      // Save the email communication in communications_log
      const communicationLog = new CommunicationLog({
        campaignId: campaign._id,
        customerId: customer._id,
        email: customer.email,
        status: 'PENDING',
        message,
      });

      const savedLog = await communicationLog.save();

      // Send the email
      const emailResult = await sendEmail(req.user, customer.email, `Special Offer for ${customer.name}`, message);

      // After email is sent, update the delivery status in the communications log
      await updateDeliveryStatus(savedLog._id);
    }

    res.status(201).json({
      message: 'Campaign created successfully',
      campaign,
      audienceCount: audience.length,
    });
  } catch (error) {
    console.error("Error creating campaign:", error);
    res.status(500).json({ error: error.message });
  }
});

// fetching all the campaigns
router.get('/get-campaigns', async (req, res) => {
  try {
    const campaigns = await Campaign.find({});

    res.status(200).json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: error.message });
  }
});

// fetching all customers
router.get('/get-customers', async (req, res) => {
  try {
    const customers = await Customer.find({});

    res.status(200).json(customers);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: error.message });
  }
});

//----------------------------------------------------------------------------------------------------------------------------

// Customer creation
router.post('/customers', async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
    console.log('Customer created successfully')
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Order creation
router.post('/orders', async (req, res) => {
    try {
      const { customerId, orderAmount, date } = req.body;
  
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      const order = new Order({
        customer: customer._id,
        orderAmount,
        date,
      });

      await order.save();
  
      customer.totalSpending += parseFloat(orderAmount);
      if (new Date(date) > new Date(customer.lastVisit)) {
        customer.lastVisit = date;
      }
  
      await customer.save();
  
      res.status(201).json(order);
    } catch (err) {
      console.error('Error creating order:', err);
      res.status(400).json({ error: err.message });
    }
});

// API to get total number of customers
router.get('/total-customers', async (req, res) => {
  try {
      const totalCustomers = await Customer.countDocuments();
      res.json({ totalCustomers });
  } catch (error) {
      console.error('Error fetching total customers:', error);
      res.status(500).json({ message: 'Error fetching total customers' });
  }
});

// API to get total number of campaigns
router.get('/total-campaigns', async (req, res) => {
  try {
      const totalCampaigns = await Campaign.countDocuments();
      res.json({ totalCampaigns });
  } catch (error) {
      console.error('Error fetching total campaigns:', error);
      res.status(500).json({ message: 'Error fetching total campaigns' });
  }
});

router.get('/campaign/:id/statistics', async (req, res) => {
  const { id } = req.params;

  try {
    const totalLogs = await CommunicationLog.countDocuments({ campaignId: id });
    const sentLogs = await CommunicationLog.countDocuments({ campaignId: id, status: 'SENT' });
    const failedLogs = await CommunicationLog.countDocuments({ campaignId: id, status: 'FAILED' });

    res.json({
      success: true,
      data: {
        audienceSize: totalLogs,
        sent: sentLogs,
        failed: failedLogs,
      },
    });
  } catch (error) {
    console.error('Error fetching statistics:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fetch audience details for a campaign
router.get('/campaign/:id/audience', async (req, res) => {
  const { id } = req.params;

  try {
    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    const audience = await campaign.getTargetAudience();

    res.json({ success: true, data: audience });
  } catch (error) {
    console.error('Error fetching audience details:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

  

module.exports = router;
