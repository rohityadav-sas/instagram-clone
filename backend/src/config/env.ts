import "dotenv/config"

function getEnvVar(key: string): string {
	const value = process.env[key]
	if (!value) {
		throw new Error(`Missing environment variable: ${key}`)
	}
	return value
}

const ENV = {
	PORT: getEnvVar("PORT"),
	FRONTEND_URL: getEnvVar("FRONTEND_URL"),
	MONGODB_URI: getEnvVar("MONGODB_URI"),
	JWT_SECRET: getEnvVar("JWT_SECRET"),
	CLOUDINARY_CLOUD_NAME: getEnvVar("CLOUDINARY_CLOUD_NAME"),
	CLOUDINARY_API_KEY: getEnvVar("CLOUDINARY_API_KEY"),
	CLOUDINARY_API_SECRET: getEnvVar("CLOUDINARY_API_SECRET"),
}

export default ENV
