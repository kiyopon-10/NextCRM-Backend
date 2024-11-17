const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',  // References the 'Customer' model
        required: true
    },
    orderAmount: Number,
    date: Date,
});

module.exports = mongoose.model('Order', orderSchema);
