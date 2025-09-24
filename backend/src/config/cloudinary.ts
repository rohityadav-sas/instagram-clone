import { v2 as cloudinary } from "cloudinary"
import ENV from "./env.js"

if (
	!ENV.CLOUDINARY_CLOUD_NAME ||
	!ENV.CLOUDINARY_API_KEY ||
	!ENV.CLOUDINARY_API_SECRET
) {
	if (!ENV.CLOUDINARY_CLOUD_NAME) {
		throw new Error("CLOUDINARY_CLOUD_NAME missing")
	}
	if (!ENV.CLOUDINARY_API_KEY) {
		throw new Error("CLOUDINARY_API_KEY missing")
	}
	if (!ENV.CLOUDINARY_API_SECRET) {
		throw new Error("CLOUDINARY_API_SECRET missing")
	}
}

cloudinary.config({
	cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
	api_key: ENV.CLOUDINARY_API_KEY,
	api_secret: ENV.CLOUDINARY_API_SECRET,
})

export default cloudinary
