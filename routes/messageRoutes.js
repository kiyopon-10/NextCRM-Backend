const express = require('express');
const { sendEmail } = require('../utils/emailSender');
const CommunicationLog = require('../models/CommunicationLog');
const Campaign = require('../models/Campaign');
const Customer = require('../models/Customer');
const router = express.Router();

/**
 * API to send messages
 */
router.post('/send-messages', async (req, res) => {
  const { campaignId } = req.body;

  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    // Fetch audience for the campaign
    const audience = await Customer.find({ ...campaign.targetAudience });

    // Save to communication logs
    const logs = await CommunicationLog.insertMany(
      audience.map((customer) => ({
        campaignId,
        customerId: customer._id,
        email: customer.email,
        status: 'PENDING',
      }))
    );

    // Trigger message sending
    const promises = logs.map(async (log) => {
      const personalizedMessage = `Hi ${log.customerId.name}, here’s 10% off on your next order!`;
      const result = await sendEmail(req.user, log.email, `Campaign: ${campaign.name}`, personalizedMessage);

      // Call Delivery Receipt API
      const status = result.success ? 'SENT' : 'FAILED';
      await axios.post('http://localhost:5000/api/messages/delivery-receipt', {
        logId: log._id,
        status,
      });
    });

    await Promise.all(promises);

    res.json({ success: true, message: 'Messages sent and delivery receipts logged.' });
  } catch (error) {
    console.error('Error sending messages:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Delivery Receipt API
 */
router.post('/delivery-receipt', async (req, res) => {
  const { logId, status } = req.body;

  try {
    const log = await CommunicationLog.findById(logId);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Log not found' });
    }

    log.status = status;
    await log.save();

    res.json({ success: true, message: `Log updated to ${status}.` });
  } catch (error) {
    console.error('Error updating delivery receipt:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
