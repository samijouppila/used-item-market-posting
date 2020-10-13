const multer  = require('multer')
const storage = multer.memoryStorage()
const multerUpload = multer({
    storage: storage,
    limits: {
        files: 1,
        fileSize: 1000000 // max file size 1 MB
    }
})

const uploadFile = multerUpload.single('image');

module.exports = uploadFile;