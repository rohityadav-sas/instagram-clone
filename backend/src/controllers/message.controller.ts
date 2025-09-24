import { type Request, type Response } from "express"
import User from "../models/user.model.js"
import Chat from "../models/chat.model.js"
import Message from "../models/message.model.js"

export const send_message = async (req: Request, res: Response) => {
	try {
		const sender = await User.findById(req.id)
		if (!sender) {
			res.status(401).json({ message: "Unauthorized", success: false })
			return
		}
		const { content } = req.body as {
			content: string
		}
		if (!req.params.username) {
			res.status(400).json({
				message: "Receiver username missing",
				success: false,
			})
			return
		}
		if (!content) {
			res
				.status(400)
				.json({ message: "Message content missing", success: false })
			return
		}
		const receiver = await User.findOne({ username: req.params.username })
		if (!receiver) {
			res.status(404).json({ message: "Receiver not found", success: false })
			return
		}
		let chat = await Chat.findOne({
			members: { $all: [sender._id, receiver._id] },
		})
		if (!chat) {
			chat = await Chat.create({
				members: [sender._id, receiver._id],
				last_message: null,
			})
		}
		const message = await Message.create({
			chat: chat ? chat._id : null,
			sender: sender._id,
			message: content.trim(),
		})
		chat.last_message = message._id
		await chat.save()
		res.status(201).json({ message: "Message sent", success: true })
	} catch (err) {
		console.error("Error sending message", err)
		res.status(500).json({ message: "Internal server error", success: false })
	}
}

export const get_messages = async (req: Request, res: Response) => {
	try {
		const current_user = await User.findById(req.id)
		if (!current_user) {
			res.status(401).json({ message: "Unauthorized", success: false })
			return
		}
		const partner = await User.findOne({ username: req.params.username })
		if (!partner) {
			res.status(404).json({ message: "User not found", success: false })
			return
		}
		const chat = await Chat.findOne({
			members: { $all: [current_user._id, partner._id] },
		}).select("_id")
		if (!chat) {
			res.status(404).json({ message: "Chat not found", success: false })
			return
		}
		const messages = await Message.find({ chat: chat._id })
			.sort({ createdAt: -1 })
			.populate("sender", "username profile_picture")
		res.status(200).json({
			message: "Messages retrieved successfully",
			success: true,
			data: messages,
		})
	} catch (err) {
		console.error("Error getting messages", err)
		res.status(500).json({ message: "Internal server error", success: false })
	}
}
