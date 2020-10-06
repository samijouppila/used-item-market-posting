const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostingSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        location: {
            country: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            postalCode: {
                type: String
            }
        },
        askingPrice: {
            type: Number,
            required: true
        },
        deliveryTypes: {
            shipping: {
                type: Boolean,
                required: true
            },
            pickup: {
                type: Boolean,
                required: true
            }
        }
    },
    {
        timestamps: true
    }
);

const Posting = mongoose.model('Posting', PostingSchema);

module.exports = Posting;