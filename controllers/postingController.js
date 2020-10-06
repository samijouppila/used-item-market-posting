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

module.exports = {
    createNewPosting
}