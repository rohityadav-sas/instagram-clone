import "dotenv/config"

const ENV = {
	PORT: process.env.PORT,
	FRONTEND_URL: process.env.FRONTEND_URL,
	MONGODB_URI: process.env.MONGODB_URI,
	JWT_SECRET: process.env.JWT_SECRET,
	CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
	CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
	CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
}

export default ENV
