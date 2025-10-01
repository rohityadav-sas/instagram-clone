import { type Request, type Response } from "express"
import User from "../models/user.model.js"
import Post from "../models/post.model.js"
import Comment from "../models/comment.model.js"
import Notification from "../models/notification.model.js"

export const create_comment = async (req: Request, res: Response) => {
	try {
		const current_user = await User.findById(req.id)
		if (!current_user) {
			res.status(401).json({ message: "Unauthorized", success: false })
			return
		}
		const post = await Post.findById(req.params.post_id)
		if (!post) {
			res.status(404).json({ message: "Post not found", success: false })
			return
		}
		const { text } = req.body as { text: string }
		if (!text)
			return void res
				.status(400)
				.json({ message: "Comment text is required", success: false })
		const comment = await Comment.create({
			post: post._id,
			author: current_user._id,
			text: text.trim(),
		})
		;(
			await comment.populate("author", "username image emailVerified")
		).populate("likes", "username image emailVerified")
		await Notification.create({
			type: "comment",
			from: current_user._id,
			to: post.author,
			post: post._id,
			comment: text.trim(),
		})
		res
			.status(201)
			.json({ message: "Comment created", success: true, data: comment })
	} catch (err) {
		console.error("Error creating comment", err)
		res.status(500).json({ message: "Internal server error", success: false })
	}
}

export const delete_comment = async (req: Request, res: Response) => {
	try {
		const current_user = await User.findById(req.id)
		if (!current_user) {
			res.status(401).json({ message: "Unauthorized", success: false })
			return
		}
		const comment = await Comment.findById(req.params.comment_id)
		if (!comment) {
			res.status(404).json({ message: "Comment not found", success: false })
			return
		}
		if (comment.author.toString() !== current_user._id.toString()) {
			res.status(403).json({
				message: "You are not allowed to delete this comment",
				success: false,
			})
			return
		}
		await Comment.findByIdAndDelete(req.params.comment_id)
		res.status(200).json({ message: "Comment deleted", success: true })
	} catch (err) {
		console.error("Error deleting comment", err)
		res.status(500).json({ message: "Internal server error", success: false })
	}
}

export const get_comments = async (req: Request, res: Response) => {
	try {
		const current_user = await User.findById(req.id)
		if (!current_user) {
			res.status(401).json({ message: "Unauthorized", success: false })
			return
		}
		const post = await Post.findById(req.params.post_id)
		if (!post)
			return void res
				.status(404)
				.json({ message: "Post not found", success: false })
		const comments = await Comment.find({
			post: post._id,
			author: { $nin: current_user.blocked_users },
		})
			.populate({
				path: "author",
				select: "username image emailVerified blocked_users",
				match: { blocked_users: { $ne: current_user._id } },
			})
			.populate("likes", "username image emailVerified")

		// Filter out comments where author is null (blocked the current user)
		const filteredComments = comments.filter(
			(comment) => comment.author !== null
		)

		return void res.status(200).json({
			message: "Comments retrieved",
			success: true,
			data: filteredComments,
		})
	} catch (err) {
		console.error("Error getting comments", err)
		return void res
			.status(500)
			.json({ message: "Internal server error", success: false })
	}
}
