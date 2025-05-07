const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    refundId: {
        type: String,
        required: true,
        unique: true
    },
    transactionId: {
        type: String,
        required: true,
        ref: 'Payment'
    },
    amount: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    reason: {
        type: String,
        required: true
    },
    requestDate: {
        type: Date,
        default: Date.now
    },
    actionDate: {
        type: Date
    },
    adminComment: {
        type: String
    }
}, {
    timestamps: true // automatically add created_at and updated_at fields
});

// Index to prevent duplicate refund requests for the same transaction
refundSchema.index({ transactionId: 1 }, { unique: true });

module.exports = mongoose.model('Refund', refundSchema);