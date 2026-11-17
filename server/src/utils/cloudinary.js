const cloudinary = require("cloudinary").v2;

// server.js loads the .env file after the routes are required,
// so the keys are read when the first upload happens, not when this file is loaded
const setupCloudinary = () => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
    });
};

// Upload one file (a Buffer from multer) to Cloudinary and resolve with the upload result.
// resource_type "auto" lets Cloudinary detect image / video / audio / other files.
exports.uploadToCloudinary = (fileBuffer, folder = "chat-app") => {
    setupCloudinary();
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder, resource_type: "auto" },
            (error, result) => (error ? reject(error) : resolve(result))
        );
        uploadStream.end(fileBuffer);
    });
};

exports.isOurCloudinaryUrl = (url) => {
    return typeof url === "string" && url.startsWith(`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`);
};
