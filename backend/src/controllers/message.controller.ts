import { type Request, type Response } from "express"
import User from "../models/user.model.js"
import Chat from "../models/chat.model.js"
import Message from "../models/message.model.js"

export const send_message = async (req: Request, res: Response) => {
	try {
		const sender = await User.findById(req.id)
		if (!sender)
			return res.status(401).json({ message: "Unauthorized", success: false })

		if (!req.params.username)
			return res.status(400).json({
				message: "Receiver username missing",
				success: false,
			})

		let { content } = req.body as {
			content: string
		}
		content = content?.trim()
		if (!content)
			return res
				.status(400)
				.json({ message: "Message content missing", success: false })
		const receiver = await User.findOne({ username: req.params.username })
		if (!receiver)
			return res
				.status(404)
				.json({ message: "Receiver not found", success: false })
		let chat = await Chat.findOne({
			members: { $all: [sender._id, receiver._id].sort() },
		})
		if (!chat) {
			chat = await Chat.create({
				members: [sender._id, receiver._id].sort(),
				last_message: null,
			})
		}
		const message = await Message.create({
			chat: chat._id,
			sender: sender._id,
			message: content,
		})
		chat.last_message = message._id
		await chat.save()
		return res.status(201).json({ message: "Message sent", success: true })
	} catch (err) {
		console.error("Error sending message", err)
		return res
			.status(500)
			.json({ message: "Internal server error", success: false })
	}
}

export const get_messages = async (req: Request, res: Response) => {
	try {
		const current_user = await User.findById(req.id)
		if (!current_user)
			return res.status(401).json({ message: "Unauthorized", success: false })

		const partner = await User.findOne({ username: req.params.username })
		if (!partner)
			return res.status(404).json({ message: "User not found", success: false })

		const chat = await Chat.findOne({
			members: { $all: [current_user._id, partner._id].sort() },
		}).select("_id")

		if (!chat)
			return res.status(404).json({ message: "Chat not found", success: false })

		const messages = await Message.find({ chat: chat._id }).sort({
			createdAt: -1,
		})

		return res.status(200).json({
			message: "Messages retrieved successfully",
			success: true,
			data: messages,
		})
	} catch (err) {
		console.error("Error getting messages", err)
		return res
			.status(500)
			.json({ message: "Internal server error", success: false })
	}
}
