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
    const slug = await generatePostingSlug(req.body.title);
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

const searchForPostings = async (req, res) => {
    let {
        category,
        city,
        country,
        startDate,
        endDate,
        page
    } = req.query;

    const filterConditions = {};
    
    if (category) {
        filterConditions.category = category;
    }
    if (city) {
        filterConditions['location.city'] = city;
    }
    if (country) {
        filterConditions['location.country'] = country;
    }    
    // Check timestamps on startDate / endDate
    try {
        if (startDate) {
            const startDateArray = startDate.split('-');
            startDate = new Date(Date.UTC(startDateArray[0], startDateArray[1] - 1, startDateArray[2]));
            if (startDate.getTime() !== startDate.getTime() ) return res.status(400).send( { errorDescription: "Invalid start date query parameter" } );
            filterConditions.createdAt = {}
            filterConditions.createdAt["$gte"] = startDate;

        }
        if (endDate) {
            const endDateArray = req.query.endDate.split('-');
            endDate = new Date(Date.UTC(endDateArray[0], endDateArray[1]- 1, endDateArray[2]));
            if (endDate.getTime() !== endDate.getTime()) return res.status(400).send( { errorDescription: "Invalid end date query parameter" } );
            filterConditions.createdAt = { ...filterConditions["createdAt"]};
            filterConditions.createdAt["$lte"] = endDate;
        }
    } catch (error) {
        return res.status(400).send("Invalid date query parameters");
    }

    page = page ? page : 1;
    pagination = {};
    pagination.limit = 10;
    pagination.skip = (page - 1) * 10;
    Posting.find(
        filterConditions,
        '-__v',
        pagination
        )
        .populate('seller', '-username -birthDate -password -__v')
        .populate('images', '_id')
        .exec( function (err, postings) {
            if ( err )  {
                return res.status(400).send( { errorDescription: "Invalid query parameeters" } );
            }
            res.status(200).json(
                {
                    postings,
                    page
                }
            );
        });
}

module.exports = {
    createNewPosting,
    getExistingPosting,
    modifyExistingPosting,
    deleteExistingPosting,
    searchForPostings
}