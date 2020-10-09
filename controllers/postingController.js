const User = require('../models/User')
const Posting = require('../models/Posting')

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
    newPosting.save( (err, posting) => {
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
            // -- TODO Images --
            slug: posting.slug,
            _id: posting._id,
            createdAt: posting.createdAt,
            updatedAt: posting.updatedAt
        });
    })
}

const modifyExistingPosting = async (req, res) => {
    Posting.findOne( {slug: req.params.slug } )
        .populate('seller', '-username -birthDate -password -__v')
        .exec( function (err, posting) {
            if (err || !posting) return res.status(404).send({ errorDescription: "Posting not found"});
            if (req.user._id != String(posting.seller._id)) {
                return res.status(401).send("Unauthorized") // User can only modify their own postings
            }
            for (key in req.body) {
                if (key != 'slug') {
                    posting[key] = req.body[key]
                }
            }
            posting.save( function(err, posting) {
                if (err) return res.status(400).send({ errorDescription: "Incorrect request body" })
                res.status(200).json( posting );
            })
        });
}

const deleteExistingPosting = async (req, res) => {
    Posting.findOne( {slug: req.params.slug } )
        .populate('seller', '-username -birthDate -password -__v')
        .exec( function (err, posting) {
            if (err || !posting) return res.status(404).send({ errorDescription: "Posting not found"});
            if (req.user._id != String(posting.seller._id)) {
                return res.status(401).send("Unauthorized") // User can only delete their own postings
            }
            posting.remove( function(err, posting) {
                if (err) return res.status(500).send({ errorDescription: "Deletion failed for unknown reason" })
                res.status(200).send("OK!");
            });
        });
}

module.exports = {
    createNewPosting,
    modifyExistingPosting,
    deleteExistingPosting
}