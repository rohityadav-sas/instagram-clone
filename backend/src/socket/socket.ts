import { type Server as IOServer, type Socket } from "socket.io"
import User from "../models/user.model.js"
import Chat from "../models/chat.model.js"
import Message from "../models/message.model.js"
import Post from "../models/post.model.js"
import { auth } from "../auth/auth.js"
import { fromNodeHeaders } from "better-auth/node"

const online_users = new Map<string, string>()

export function initSocket(io: IOServer) {
	io.use(async (socket, next) => {
		try {
			const payload = await auth.api.getSession({
				headers: fromNodeHeaders(socket.handshake.headers),
			})
			socket.data.userId = payload?.user?.id
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
				const user = await User.findById(userId).select("username image")
				if (!user) return
				const post = await Post.findOne({ _id: postId })
				io.to(online_users.get(post?.author?.toString() || "") || "").emit(
					"postLiked",
					{
						post_image: post?.image || "",
						username: user.username,
						image: user.image,
					}
				)
			} catch (err) {
				// silent catch
			}
		})

		socket.on("commentPost", async (postId: string) => {
			try {
				const user = await User.findById(userId).select("username image")
				if (!user) return
				const post = await Post.findOne({ _id: postId })
				io.to(online_users.get(post?.author?.toString() || "") || "").emit(
					"postCommented",
					{
						post_image: post?.image || "",
						username: user.username,
						image: user.image,
					}
				)
			} catch (err) {
				// silent catch
			}
		})

		socket.on("followUser", async (followedUserId: string) => {
			try {
				const user = await User.findById(userId).select("username image")
				if (!user) return
				io.to(online_users.get(followedUserId) || "").emit("newFollower", {
					username: user.username,
					image: user.image,
				})
			} catch (err) {}
		})
	})
}
export { online_users }
export default initSocket
