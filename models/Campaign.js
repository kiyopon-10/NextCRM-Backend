const mongoose = require('mongoose');
const Customer = require('./Customer');

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  targetAudience: {
    spending: {
      min: {
        type: Number,
      },
      max: {
        type: Number,
      },
    },
    lastVisit: {
      before: {
        type: Date,
      },
      after: {
        type: Date,
      },
    },
    visits: {
      min: {
        type: Number,
      },
      max: {
        type: Number,
      },
    },
  },
  members: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Method to get customers based on target audience criteria
campaignSchema.methods.getTargetAudience = async function () {
  const { spending, lastVisit, visits } = this.targetAudience;
  let query = {};

  // Filter by spending
  if (spending) {
    if (spending.min != null) query.totalSpending = { $gte: spending.min };
    if (spending.max != null) {
      query.totalSpending = query.totalSpending || {};
      query.totalSpending.$lte = spending.max;
    }
  }

  // Filter by last visit
  if (lastVisit) {
    if (lastVisit.before) {
      query.lastVisit = query.lastVisit || {};
      query.lastVisit.$lte = lastVisit.before;
    }
    if (lastVisit.after) {
      query.lastVisit = query.lastVisit || {};
      query.lastVisit.$gte = lastVisit.after;
    }
  }

  // Filter by number of visits
  if (visits) {
    if (visits.min != null) {
      query.numberOfVisits = query.numberOfVisits || {};
      query.numberOfVisits.$gte = visits.min;
    }
    if (visits.max != null) {
      query.numberOfVisits = query.numberOfVisits || {};
      query.numberOfVisits.$lte = visits.max;
    }
  }

  // Fetch customers that match the criteria
  const customers = await Customer.find(query);
  return customers;
};

module.exports = mongoose.model('Campaign', campaignSchema);
