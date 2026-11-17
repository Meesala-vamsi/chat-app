const multer = require("multer");
const ErrorResponse = require("../utils/errorResponse");

const MAX_FILE_SIZE_MB = 20;
const MAX_FILES = 5;

const allowedMimeTypes = [
    "image/",
    "video/",
    "audio/",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument",
    "text/plain"
];

// files stay in memory and go straight to Cloudinary, nothing is saved on the server disk
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024, files: MAX_FILES },
    fileFilter: (req, file, callback) => {
        const isAllowed = allowedMimeTypes.some((type) => file.mimetype.startsWith(type));
        callback(isAllowed ? null : new ErrorResponse(`File type ${file.mimetype} is not allowed.`, 400), isAllowed);
    }
}).array("files", MAX_FILES);

// turns multer errors (file too large, too many files) into normal 400 responses
exports.uploadFiles = (req, res, next) => {
    upload(req, res, (error) => {
        if (!error) return next();
        if (error instanceof multer.MulterError) {
            const message = error.code === "LIMIT_FILE_SIZE"
                ? `Each file must be smaller than ${MAX_FILE_SIZE_MB} MB.`
                : error.code === "LIMIT_UNEXPECTED_FILE" || error.code === "LIMIT_FILE_COUNT"
                    ? `You can upload up to ${MAX_FILES} files at once, in the "files" field.`
                    : error.message;
            return next(new ErrorResponse(message, 400));
        }
        return next(error);
    });
};
