const slugify = require('slugify');
const Posting = require('../models/Posting')
const { v4: uuidv4 } = require('uuid');

const generatePostingSlug = async (title) => {
    let slug = slugify(title, {lower: true}).substring(0, 40);
    const postingWithSameSlug = await Posting.findOne({ slug: slug });
    if (postingWithSameSlug) {
        slug = slug + "-" + uuidv4()
    }
    return slug;
}

module.exports = {
    generatePostingSlug
};