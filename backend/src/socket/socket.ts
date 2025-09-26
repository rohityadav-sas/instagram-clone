import express from "express"
import { Server } from "socket.io"
import { createServer } from "http"
import ENV from "../config/env.js"

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
	cors: {
		origin: ENV.FRONTEND_URL,
		methods: ["GET", "POST"],
	},
})

const online_users = new Map<string, string>()

io.on("connection", (socket) => {
	const userId = socket.handshake.query.userId
	if (typeof userId === "string") {
		online_users.set(userId, socket.id)
		console.log(
			"User connected: ",
			"UserId = ",
			userId,
			"SocketId = ",
			socket.id,
			"\n"
		)
		io.emit("onlineUsers", Array.from(online_users.keys()))
		socket.on("disconnect", () => {
			online_users.delete(userId)
			io.emit("onlineUsers", Array.from(online_users.keys()))
			console.log("User disconnected: ", userId, "\n")
		})
	}
})

export { app, httpServer, io }
