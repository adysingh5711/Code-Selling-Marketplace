import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
    listingId: {
        type: Number,
        required: true,
        ref: 'Listing'
    },
    buyer: {
        type: String,
        required: true
    },
    seller: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    transactionHash: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled', 'disputed'],
        default: 'pending'
    },
    escrowExpiry: {
        type: Number,
        required: true
    },
    codeAccess: {
        type: String,
        required: true
    },
    downloadCount: {
        type: Number,
        default: 0
    },
    lastDownload: {
        type: Number
    },
    review: {
        rating: Number,
        comment: String,
        timestamp: Number
    }
}, {
    timestamps: true
});

// Indexes for better query performance
purchaseSchema.index({ buyer: 1 });
purchaseSchema.index({ seller: 1 });
purchaseSchema.index({ status: 1 });
purchaseSchema.index({ listingId: 1 });

const Purchase = mongoose.model('Purchase', purchaseSchema);

export default Purchase; 