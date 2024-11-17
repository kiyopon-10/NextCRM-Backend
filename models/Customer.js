const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: String,
    email: String,
    totalSpending: Number,
    lastVisit: Date,
    visitCount: Number
});

module.exports = mongoose.model('Customer', customerSchema);
