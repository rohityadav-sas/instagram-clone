import { type Server as IOServer, type Socket } from "socket.io"
import jwt, { type JwtPayload } from "jsonwebtoken"
import ENV from "../config/env.js"
import User from "../models/user.model.js"
import Chat from "../models/chat.model.js"
import Message from "../models/message.model.js"
import Post from "../models/post.model.js"

const online_users = new Map<string, string>()

export function initSocket(io: IOServer) {
	io.use((socket, next) => {
		try {
			let token = socket.handshake.headers.cookie
				?.split("; ")
				.find((c) => c.startsWith("token="))
				?.split("=")[1]
			if (!token) token = socket.handshake.headers.token as string
			if (!token) return next(new Error("Token missing"))
			const payload = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload
			if (!payload || !payload.id) return next(new Error("Invalid token"))
			socket.data.userId = payload.id
			next()
		} catch (err) {
			return next(new Error("Authentication error"))
		}
	})

	io.on("connection", async (socket: Socket) => {
		const userId = socket.data.userId
		online_users.set(userId, socket.id)
		const username = await User.findById(userId).select("username -_id")
		console.log(`User connected: ${userId}, ${username?.username}\n`)
		io.emit("onlineUsers", Array.from(online_users.keys()))

		socket.on("disconnect", () => {
			online_users.delete(userId)
			console.log(`User disconnected: ${userId}, ${username?.username}\n`)
			io.emit("onlineUsers", Array.from(online_users.keys()))
		})

		socket.on(
			"sendMessage",
			async (
				payload: { receiver: string; content: string },
				ack: (response: {
					success: boolean
					message: string
					data: any
				}) => void
			) => {
				try {
					const sender = await User.findById(userId)
					if (!sender)
						return ack({
							success: false,
							message: "Sender not found",
							data: null,
						})
					const { receiver, content } = payload
					if (!receiver || !content.trim())
						return ack({
							success: false,
							message: "Invalid payload",
							data: null,
						})
					const receiverUser = await User.findById(receiver)
					if (!receiverUser)
						return ack({
							success: false,
							message: "Receiver not found",
							data: null,
						})
					let chat = await Chat.findOne({
						members: { $all: [sender._id, receiverUser._id].sort() },
					})
					if (!chat) {
						chat = await Chat.create({
							members: [sender._id, receiverUser._id].sort(),
							last_message: null,
						})
					}
					const message = await Message.create({
						chat: chat._id,
						sender: sender._id,
						message: content.trim(),
					})
					chat.last_message = message._id
					await chat.save()
					const receiverSocketId = online_users.get(receiverUser._id.toString())
					const outgoing = {
						_id: message._id,
						sender: sender._id,
						chat: chat._id,
						message: message.message,
						read_by: message.read_by,
						createdAt: message.createdAt,
					}
					if (receiverSocketId)
						io.to(receiverSocketId).emit("newMessage", outgoing)
					socket.emit("newMessage", outgoing)
					return ack({
						success: true,
						message: "Message sent",
						data: outgoing,
					})
				} catch (err) {
					console.error(err)
					return ack({
						success: false,
						message: "Internal server error",
						data: null,
					})
				}
			}
		)

		socket.on(
			"messagesRead",
			async (
				payload: { chatId: string; messageIds: string[] },
				ack: (response: { success: boolean }) => void
			) => {
				try {
					const { chatId, messageIds } = payload
					if (!chatId || !messageIds || messageIds.length === 0) {
						return ack({
							success: false,
						})
					}
					// Mark messages as seen in the database
					await Message.updateMany(
						{ _id: { $in: messageIds }, chat: chatId },
						{ $addToSet: { read_by: socket.data.userId } }
					)

					// Notify other members in the chat about the seen status
					const chat = await Chat.findById(chatId).select("members -_id")
					const memberSockets = chat?.members
						.map((memberId) => online_users.get(memberId.toString()))
						.filter((socketId) => socketId)

					memberSockets?.forEach((socketId) => {
						io.to(socketId!).emit("messagesRead", {
							chatId,
							readerId: socket.data.userId,
						})
					})

					return ack({
						success: true,
					})
				} catch (err) {
					console.error(err)
					return ack({
						success: false,
					})
				}
			}
		)
		socket.on("typing", (payload: { receiver: string }) => {
			try {
				const receiverSocketId = online_users.get(payload.receiver)
				if (receiverSocketId)
					io.to(receiverSocketId).emit("typing", {
						sender: userId,
					})
			} catch (err) {}
		})

		socket.on("likePost", async (postId: string) => {
			try {
				const user = await User.findById(userId).select(
					"username profile_picture"
				)
				if (!user) return
				const post = await Post.findOne({ _id: postId })
				io.to(online_users.get(post?.author?.toString() || "") || "").emit(
					"postLiked",
					{
						post_image: post?.image || "",
						username: user.username,
						profile_picture: user.profile_picture,
					}
				)
			} catch (err) {
				// silent catch
			}
		})

		socket.on("commentPost", async (postId: string) => {
			try {
				const user = await User.findById(userId).select(
					"username profile_picture"
				)
				if (!user) return
				const post = await Post.findOne({ _id: postId })
				io.to(online_users.get(post?.author?.toString() || "") || "").emit(
					"postCommented",
					{
						post_image: post?.image || "",
						username: user.username,
						profile_picture: user.profile_picture,
					}
				)
			} catch (err) {
				// silent catch
			}
		})

		socket.on("followUser", async (followedUserId: string) => {
			try {
				const user = await User.findById(userId).select(
					"username profile_picture"
				)
				if (!user) return
				io.to(online_users.get(followedUserId) || "").emit("newFollower", {
					username: user.username,
					profile_picture: user.profile_picture,
				})
			} catch (err) {}
		})
	})
}
export { online_users }
export default initSocket
