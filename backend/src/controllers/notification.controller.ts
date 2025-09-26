import { type Request, type Response } from "express"
import Notification from "../models/notification.model.js"

export const getNotifications = async (req: Request, res: Response) => {
	try {
		const userId = req.id
		const notifications = await Notification.find({ to: userId })
			.populate("from", "username profile_picture isVerified")
			.populate("post", "image")
			.sort({ createdAt: -1 })

		return res.status(200).json({ success: true, data: notifications })
	} catch (err) {
		console.error("Error fetching notifications", err)
		return res
			.status(500)
			.json({ success: false, message: "Internal Server Error" })
	}
}

export const markAsRead = async (req: Request, res: Response) => {
	try {
		const userId = req.id

		const notif = await Notification.findOneAndUpdate(
			{ _id: req.params.id, to: userId },
			{ $set: { isRead: true } },
			{ new: true }
		)

		if (!notif)
			return res
				.status(404)
				.json({ success: false, message: "Notification not found" })

		return res.status(200).json({ success: true, data: notif })
	} catch (err) {
		console.error("Error marking notification as read", err)
		return res
			.status(500)
			.json({ success: false, message: "Internal Server Error" })
	}
}

export const markAllAsRead = async (req: Request, res: Response) => {
	try {
		await Notification.updateMany(
			{ to: req.id, isRead: false },
			{ $set: { isRead: true } }
		)
		return res
			.status(200)
			.json({ success: true, message: "All notifications marked as read" })
	} catch (err) {
		console.error("Error marking all notifications as read", err)
		return res
			.status(500)
			.json({ success: false, message: "Internal Server Error" })
	}
}

export const deleteNotification = async (req: Request, res: Response) => {
	try {
		const notif = await Notification.findOneAndDelete({
			_id: req.params.id,
			to: req.id,
		})

		if (!notif)
			return res
				.status(404)
				.json({ success: false, message: "Notification not found" })

		return res
			.status(200)
			.json({ success: true, message: "Notification deleted" })
	} catch (err) {
		console.error("Error deleting notification", err)
		return res
			.status(500)
			.json({ success: false, message: "Internal Server Error" })
	}
}

export const getUnreadCount = async (req: Request, res: Response) => {
	try {
		const count = await Notification.countDocuments({
			to: req.id,
			isRead: false,
		})
		return res.status(200).json({ success: true, count })
	} catch (err) {
		console.error("Error fetching unread count", err)
		return res
			.status(500)
			.json({ success: false, message: "Internal Server Error" })
	}
}
