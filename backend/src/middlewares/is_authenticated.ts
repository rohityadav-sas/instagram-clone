import jwt from "jsonwebtoken"
import { type Request, type Response, type NextFunction } from "express"
import ENV from "../config/env.js"

export const is_authenticated = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
	if (!token) {
		res.status(401).json({ message: "Unauthorized", success: false })
		return
	}
	try {
		if (!ENV.JWT_SECRET) {
			res.status(500).json({ message: "JWT_SECRET missing", success: false })
			return
		}
		const decoded = jwt.verify(token, ENV.JWT_SECRET) as {
			id: string
		}
		req.id = decoded.id
		next()
	} catch (err) {
		res.status(401).json({ message: "Invalid token", success: false })
	}
}
