const multer = require('multer');

const storage = multer.diskStorage({
    destination: 'uploads/avatars', // Specify the directory where avatar files will be stored
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = file.originalname;
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    },
});

const upload = multer({ storage: storage });

module.exports = { upload };