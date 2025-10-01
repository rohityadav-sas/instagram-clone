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
	CLOUDINARY_CLOUD_NAME: getEnvVar("CLOUDINARY_CLOUD_NAME"),
	CLOUDINARY_API_KEY: getEnvVar("CLOUDINARY_API_KEY"),
	CLOUDINARY_API_SECRET: getEnvVar("CLOUDINARY_API_SECRET"),
	GITHUB_CLIENT_ID: getEnvVar("GITHUB_CLIENT_ID"),
	GITHUB_CLIENT_SECRET: getEnvVar("GITHUB_CLIENT_SECRET"),
	BETTER_AUTH_SECRET: getEnvVar("BETTER_AUTH_SECRET"),
	GOOGLE_APP_PASSWORD: getEnvVar("GOOGLE_APP_PASSWORD"),
	GOOGLE_CLIENT_ID: getEnvVar("GOOGLE_CLIENT_ID"),
	GOOGLE_CLIENT_SECRET: getEnvVar("GOOGLE_CLIENT_SECRET"),
}

export default ENV
