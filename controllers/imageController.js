const Image = require('../models/Image')

const getSelectedImage = async (req, res) => {
    Image.findOne({_id: req.params.id}, function(err, image) {
        if (err || !image) return res.status(400).send({ errorDescription: "Image not found"});
        res.set("Content-Type", image.image.contentType);
        res.send( image.image.data );
    })
}

module.exports = {
    getSelectedImage
}
