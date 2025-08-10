const multer = require('multer');

//Configure storage
const storage=multer.diskStorage({
    destination:(req, file, cb) => {
        cb(null, 'uploads/'); // Directory to save uploaded files
    },
    filename:(req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
    },
});

//File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if(allowedTypes.includes(file.mimetype)) {
        cb(null, true); // Accept file
    }else {
        cb(new Error('Only .jpeg, .jpg and .png files are allowed'), false); // Reject file
    }
};

const upload=multer({storage, fileFilter});
module.exports=upload;