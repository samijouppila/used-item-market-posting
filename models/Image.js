const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema(
    {
        image: {
            name: String,
            data: Buffer,
            contentType: String
        },
        posting: {
            type: Schema.ObjectId,
            ref: 'Posting'
        }
    }
);

const Image = mongoose.model('Image', ImageSchema);

module.exports = Image;