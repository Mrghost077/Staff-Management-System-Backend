import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// 1. Configuring Cloudinary credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Setup Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'teachgrid_leaves', 
        allowed_formats: ['jpg', 'png', 'pdf', 'doc', 'docx'],
        resource_type: 'auto', 
        public_id: (req, file) => `${Date.now()}-${file.originalname.split('.')[0]}`,
    },
});

// 3. Initialize Multer with Cloudinary Storage
const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export default upload;