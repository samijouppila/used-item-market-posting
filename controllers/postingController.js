const User = require('../models/User')
const Posting = require('../models/Posting')
const Image = require('../models/Image')

const {
    generatePostingSlug
} = require('../utils/generators');

const createNewPosting = async (req, res) => {
    if (!(typeof req.body['title'] === 'string')) {
        return res.status(400).send({
            errorDescription: "Title missing or in wrong format"
        })
    }
    if (!req.body['deliveryTypes']['shipping'] && !req.body['deliveryTypes']['pickup']) {
        return res.status(400).send({
            errorDescription: "Posting must have a valid delivery type"
        })
    }
    const slug = await generatePostingSlug(req.body.description);
    const newPosting = new Posting({
        ...req.body,
        seller: req.user._id,
        slug
    });
    newPosting.save((err, posting) => {
        if (err) {
            return res.status(400).send({
                errorDescription: "Bad request"
            });
        }
        res.status(201).json({
            title: posting.title,
            description: posting.description,
            category: posting.category,
            location: posting.location,
            askingPrice: posting.askingPrice,
            deliveryTypes: posting.deliveryTypes,
            seller: {
                contactInformation: req.user.contactInformation,
                _id: req.user._id
            },
            images: posting.images,
            slug: posting.slug,
            _id: posting._id,
            createdAt: posting.createdAt,
            updatedAt: posting.updatedAt
        });
    })
}

const getExistingPosting = async (req, res) => {
    Posting.findOne({ slug: req.params.slug }, '-__v')
        .populate('seller', '-username -birthDate -password -__v')
        .populate('images', '_id')
        .exec(function (err, posting) {
            if (err || !posting) {
                return res.status(404).send({ errorDescription: "Posting not found" });
            }
            res.status(200).json(posting);
        });
}

const modifyExistingPosting = async (req, res) => {
    Posting.findOne({ slug: req.params.slug }, '-__v')
        .populate('seller', '-username -birthDate -password -__v')
        .populate('images', '_id')
        .exec(function (err, posting) {
            if (err || !posting) {
                return res.status(404).send({ errorDescription: "Posting not found" });
            }
            if (req.user._id != String(posting.seller._id)) {
                return res.status(401).send("Unauthorized") // User can only modify their own postings
            }
            for (key in req.body) {
                if (key != 'slug') {
                    posting[key] = req.body[key]
                }
            }
            posting.save(function (err, posting) {
                if (err) return res.status(400).send({ errorDescription: "Incorrect request body" })
                res.status(200).json(posting);
            })
        });
}

const deleteExistingPosting = async (req, res) => {
    Posting.findOne({ slug: req.params.slug }, '-__v')
        .populate('seller', '-username -birthDate -password -__v')
        .exec(function (err, posting) {
            if (err || !posting) return res.status(404).send({ errorDescription: "Posting not found" });
            if (req.user._id != String(posting.seller._id)) {
                return res.status(401).send("Unauthorized") // User can only delete their own postings
            }
            posting.remove(function (err, posting) {
                if (err) return res.status(500).send({ errorDescription: "Deletion failed for unknown reason" })
                res.status(200).send("OK!");
            });
        });
}

const addImageToPosting = async (req, res) => {
    Posting.findOne({ slug: req.params.slug }, '-__v')
        .populate('seller', '-username -birthDate -password -__v')
        .exec(async function (err, posting) {
            if (err || !posting) return res.status(404).send({ errorDescription: "Posting not found" });
            if (req.user._id != String(posting.seller._id)) {
                return res.status(401).send("Unauthorized") // User can only upload images to their own postings
            }
            if (posting.images.length >= 4) {
                return res.status(400).send("Only up to 4 images are allowed for each posting") 
            }
            const image = new Image({
                image: {
                    name: req.file.originalname || "image.jpg",
                    data: req.file.buffer,
                    contentType: req.file.mimetype
                },
                posting: posting._id
            });
            image.save(async (err, image) => {
                if (err || !image) {
                    return res.status(400).json({
                        errorDescription: "Could not process your file type"
                    });
                }
                posting.images.push(image);
                await posting.save();
                res.status(201).json({
                    _id: image._id
                })
            })
        });
}

const deleteSelectedImage = async (req, res) => {
    Image.findOne( {_id: req.params.id}, '-__v -image')
        .populate('posting', '_id images slug seller deliveryTypes')
        .populate('seller', '_id')
        .exec( async function (err, image) {
            if (err || !image) return res.status(404).send({ errorDescription: "Image not found" });
            if (req.params.slug != image.posting.slug) {
                return res.status(401).send("Unauthorized") // Verify the user is deleting the image from the correct posting
            }
            if (req.user._id != String(image.posting.seller._id)) {
                return res.status(401).send("Unauthorized") // Verify user in token is the same as the user who owns the posting
            }
            image.remove(async function (err, image) {
                if (err) return res.status(500).send({ errorDescription: "Deletion failed for unknown reason" })
                await Posting.updateOne( 
                    {"images" : image._id},
                    { "$pull": { "images": image._id}}
                );
                res.status(200).send("OK!");
            });
        })
}

module.exports = {
    createNewPosting,
    getExistingPosting,
    modifyExistingPosting,
    deleteExistingPosting,
    addImageToPosting,
    deleteSelectedImage
}