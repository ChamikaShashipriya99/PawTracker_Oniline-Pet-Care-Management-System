const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true
    },
    serviceType: {
        type: String,
        required: true,
        enum: ['grooming', 'boarding', 'training', 'veterinary', 'other']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    adminReply: {
        message: {
            type: String,
            trim: true
        },
        repliedAt: {
            type: Date
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
feedbackSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Feedback = mongoose.model('feedbacks', feedbackSchema);

module.exports = Feedback; 