const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema(
    {
        publicId: {
            type: String,
            required: true
        }
    }
);

const Image = mongoose.model('Image', ImageSchema);

module.exports = Image;