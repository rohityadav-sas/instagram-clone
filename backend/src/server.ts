import express, { urlencoded, type Response } from "express"
import cors from "cors"
import ENV from "./config/env.js"
import cookie_parser from "cookie-parser"
import connect_db from "./config/db.js"
import user_routes from "./routes/user.route.js"
import post_routes from "./routes/post.route.js"
import comment_routes from "./routes/comment.route.js"
import message_routes from "./routes/message.route.js"
import story_routes from "./routes/story.route.js"

const app = express()

app.use(
	cors({
		origin: ENV.FRONTEND_URL,
		credentials: true,
	})
)
app.use(express.json())
app.use(urlencoded({ extended: true }))
app.use(cookie_parser())

// Routes
app.use("/api/users", user_routes)
app.use("/api/posts", post_routes)
app.use("/api/comments", comment_routes)
app.use("/api/messages", message_routes)
app.use("/api/stories", story_routes)

app.get("/api", (_, res: Response) => {
	res.json({ message: "Hello from backend!" })
})

app.listen(ENV.PORT, () =>
	connect_db().then(() =>
		console.log(`Backend running on http://localhost:${ENV.PORT}`)
	)
)
