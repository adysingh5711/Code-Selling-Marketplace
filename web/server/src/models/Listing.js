import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    owner: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    codeHash: {
        type: String,
        required: true
    },
    encryptedCode: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    escrowBalance: {
        type: Number,
        default: 0
    },
    timestamp: {
        type: Number,
        default: () => Math.floor(Date.now() / 1000)
    },
    purchaseCount: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    },
    reviews: [{
        buyer: String,
        rating: Number,
        comment: String,
        timestamp: Number
    }]
}, {
    timestamps: true
});

// Indexes for better query performance
listingSchema.index({ owner: 1 });
listingSchema.index({ isActive: 1 });
listingSchema.index({ tags: 1 });
listingSchema.index({ language: 1 });

const Listing = mongoose.model('Listing', listingSchema);

export default Listing; 