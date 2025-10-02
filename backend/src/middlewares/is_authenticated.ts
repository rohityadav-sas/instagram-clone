import { type Request, type Response, type NextFunction } from "express"
import { auth } from "../auth/auth.js"
import { fromNodeHeaders } from "better-auth/node"

export const is_authenticated = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const session = await auth.api.getSession({
			headers: fromNodeHeaders(req.headers),
		})
		if (
			!session &&
			req.headers.authorization &&
			req.headers.authorization.startsWith("Bearer ")
		) {
			return res
				.status(401)
				.json({ message: "Session expired", success: false })
		}

		if (!session) {
			return res.status(401).json({ message: "Unauthorized", success: false })
		}

		req.id = session.user?.id
		return next()
	} catch (err) {
		res.status(401).json({ message: "Error on middleware", success: false })
	}
}
