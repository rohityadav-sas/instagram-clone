import express, { urlencoded, type Response, type Request } from "express"
import cors from "cors"
import ENV from "./config/env.js"
import cookie_parser from "cookie-parser"
import connect_db from "./config/db.js"
import user_routes from "./routes/user.route.js"
import post_routes from "./routes/post.route.js"
import comment_routes from "./routes/comment.route.js"
import message_routes from "./routes/message.route.js"
import story_routes from "./routes/story.route.js"
import notification_routes from "./routes/notification.route.js"
import { Server as IOServer } from "socket.io"
import { createServer } from "http"
import initSocket from "./socket/socket.js"
import { fromNodeHeaders, toNodeHandler } from "better-auth/node"
import { auth } from "./auth/auth.js"
const app = express()
const httpServer = createServer(app)
const io = new IOServer(httpServer, {
	cors: {
		origin: ENV.FRONTEND_URL,
		methods: ["GET", "POST"],
		credentials: true,
	},
})
initSocket(io)

app.use(
	cors({
		origin: ENV.FRONTEND_URL,
		credentials: true,
	})
)
app.use(cookie_parser())

app.all("/api/auth/*splat", toNodeHandler(auth))
app.use(express.json())
app.use(urlencoded({ extended: true }))

// Routes
app.use("/api/users", user_routes)
app.use("/api/posts", post_routes)
app.use("/api/comments", comment_routes)
app.use("/api/messages", message_routes)
app.use("/api/stories", story_routes)
app.use("/api/notifications", notification_routes)

app.get("/api", async (req: Request, res: Response) => {
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers),
	})
	return res.json(session)
})

httpServer.listen(ENV.PORT, () =>
	connect_db().then(() =>
		console.log(`Backend running on http://localhost:${ENV.PORT}`)
	)
)

export { io }
