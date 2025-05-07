const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['paid', 'failed'],
        default: 'paid'
    },
    purpose: {
        type: String,
        required: true
    },
    payment_method: {
        type: String,
        required: true
    },
    paymentDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // automatically add created_at and updated_at fields
});

module.exports = mongoose.model('Payment', paymentSchema); 