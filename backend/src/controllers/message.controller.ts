import { type Request, type Response } from "express"
import User from "../models/user.model.js"
import Chat from "../models/chat.model.js"
import Message from "../models/message.model.js"
import mongoose from "mongoose"

export const get_messages = async (req: Request, res: Response) => {
	try {
		const current_user = await User.findById(req.id)
		if (!current_user)
			return res.status(401).json({ message: "Unauthorized", success: false })

		const identifier = req.params.identifier as string
		let match: Record<string, any>
		if (mongoose.Types.ObjectId.isValid(identifier)) {
			match = {
				$or: [
					{ username: identifier },
					{ _id: new mongoose.Types.ObjectId(identifier) },
				],
			}
		} else {
			match = { username: identifier }
		}

		const partner = await User.findOne(match)
		if (!partner)
			return res.status(404).json({ message: "User not found", success: false })

		const chat = await Chat.findOne({
			members: { $all: [current_user._id, partner._id].sort() },
		}).select("_id")

		if (!chat)
			return res.status(404).json({ message: "Chat not found", success: false })

		const messages = await Message.find({ chat: chat._id })
			.sort({
				createdAt: -1,
			})
			.select("-__v -updatedAt")

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

export const get_last_messages = async (req: Request, res: Response) => {
	try {
		const current_user = await User.findById(req.id)
		if (!current_user)
			return res.status(401).json({ message: "Unauthorized", success: false })

		const chat = await Chat.find({
			members: current_user._id,
		})
			.populate("last_message", "message createdAt")
			.populate("members", "_id username image emailVerified")
			.select("-__v -updatedAt -createdAt")

		const chatsWithoutCurrentUser = chat.map((c) => ({
			...c.toObject(), // convert Mongoose doc to plain JS object
			members: c.members.filter(
				(m) => m._id.toString() !== current_user._id.toString()
			),
		}))

		// Add unread count for each chat
		const chatsWithUnreadCount = await Promise.all(
			chatsWithoutCurrentUser.map(async (chat) => {
				const unreadCount = await Message.countDocuments({
					chat: chat._id,
					read_by: { $ne: req.id },
				})
				return {
					...chat,
					unreadCount,
				}
			})
		)

		// Use chatsWithUnreadCount instead of chatsWithoutCurrentUser
		const finalChats = chatsWithUnreadCount

		const chatUserIds = chat
			.flatMap((c) => c.members) // c.members is an array
			.map((u) => u._id.toString()) // get only _id as string
			.filter((id) => id !== current_user._id.toString())

		const chatNotStarted = await User.find({
			$or: [{ followers: current_user._id }, { following: current_user._id }],
			_id: { $nin: chatUserIds },
		}).select("_id username image emailVerified")

		return res.status(200).json({
			message: "Last messages retrieved successfully",
			success: true,
			data: {
				existingChats: finalChats,
				availableUsersForNewChat: chatNotStarted,
			},
		})
	} catch (err) {
		console.error("Error getting last messages", err)
		return res
			.status(500)
			.json({ message: "Internal server error", success: false })
	}
}
