import { type Request, type Response } from "express"
import Story from "../models/story.model.js"
import User from "../models/user.model.js"
import { v2 as cloudinary } from "cloudinary"
import { get_data_uri } from "../utils/data_uri.js"
import mongoose from "mongoose"

// Create a new story
export const createStory = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id: userId } = req
		const image = req.file

		if (!image)
			return void res.status(400).json({
				message: "Image is required",
				success: false,
			})

		// Upload image to cloudinary
		const fileUri = await get_data_uri(image)
		const cloudResponse = await cloudinary.uploader.upload(fileUri)

		const story = await Story.create({
			image: cloudResponse.secure_url,
			image_public_id: cloudResponse.public_id,
			author: userId,
		})

		await story.populate("author", "username image")

		res.status(201).json({
			message: "Story created successfully",
			success: true,
			story,
		})
	} catch (error) {
		console.error("Error creating story:", error)
		res.status(500).json({
			message: "Internal server error",
			success: false,
		})
	}
}

// Get all stories for feed (not expired, ordered by creation time)
export const getStories = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id: userId } = req

		// Get stories from users that the current user follows (including own stories)
		// Exclude blocked users and users who blocked current user
		const user = await User.findById(userId).select("following blocked_users")
		if (!user)
			return void res.status(404).json({
				message: "User not found",
				success: false,
			})

		// Filter out blocked users from following list
		const followingIds = user.following.filter(
			(followingId: any) => !user.blocked_users.includes(followingId)
		)
		followingIds.push(new mongoose.Types.ObjectId(userId)) // Include own stories

		const stories = await Story.find({
			author: {
				$in: followingIds,
				$nin: user.blocked_users,
			},
			expiresAt: { $gt: new Date() }, // Only non-expired stories
		})
			.populate({
				path: "author",
				select: "username image blocked_users",
				match: { blocked_users: { $ne: userId } },
			})
			.sort({ createdAt: -1 })

		// Filter out stories where author is null (blocked the current user)
		const filteredStories = stories.filter((story) => story.author !== null)

		// Group stories by author
		const groupedStories = filteredStories.reduce((acc: any, story: any) => {
			const authorId = story.author._id.toString()
			if (!acc[authorId]) {
				acc[authorId] = {
					author: story.author,
					stories: [],
					hasNewStory: true,
					isOwn: authorId === userId,
				}
			}
			acc[authorId].stories.push(story)
			return acc
		}, {})

		const formattedStories = Object.values(groupedStories)

		res.status(200).json({
			message: "Stories fetched successfully",
			success: true,
			stories: formattedStories,
		})
	} catch (error) {
		console.error("Error fetching stories:", error)
		res.status(500).json({
			message: "Internal server error",
			success: false,
		})
	}
}

// Get stories by specific user
export const getUserStories = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { userId } = req.params
		const currentUserId = req.id

		// Check if current user is blocked by the story owner or vice versa
		const [storyOwner, currentUser] = await Promise.all([
			User.findById(userId).select("blocked_users"),
			User.findById(currentUserId).select("blocked_users"),
		])

		if (!storyOwner || !currentUser) {
			return void res.status(404).json({
				message: "User not found",
				success: false,
			})
		}

		// Check if users have blocked each other
		const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId)
		const userObjectId = new mongoose.Types.ObjectId(userId)

		if (
			storyOwner.blocked_users?.includes(currentUserObjectId) ||
			currentUser.blocked_users?.includes(userObjectId)
		) {
			return void res.status(404).json({
				message: "User not found",
				success: false,
			})
		}

		const stories = await Story.find({
			author: userId,
			expiresAt: { $gt: new Date() }, // Only non-expired stories
		})
			.populate("author", "username image")
			.sort({ createdAt: -1 })

		res.status(200).json({
			message: "User stories fetched successfully",
			success: true,
			stories,
		})
	} catch (error) {
		console.error("Error fetching user stories:", error)
		res.status(500).json({
			message: "Internal server error",
			success: false,
		})
	}
}

// Get specific story by ID
export const getStoryById = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id: storyId } = req.params
		const currentUserId = req.id

		const story = await Story.findById(storyId).populate(
			"author",
			"username image"
		)

		if (!story) {
			res.status(404).json({
				message: "Story not found",
				success: false,
			})
			return
		}

		// Check if current user is blocked by story author or vice versa
		const [storyAuthor, currentUser] = await Promise.all([
			User.findById(story.author._id).select("blocked_users"),
			User.findById(currentUserId).select("blocked_users"),
		])

		if (!storyAuthor || !currentUser) {
			res.status(404).json({
				message: "Story not found",
				success: false,
			})
			return
		}

		const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId)
		const storyAuthorObjectId = new mongoose.Types.ObjectId(
			story.author._id.toString()
		)

		if (
			storyAuthor.blocked_users?.includes(currentUserObjectId) ||
			currentUser.blocked_users?.includes(storyAuthorObjectId)
		) {
			res.status(404).json({
				message: "Story not found",
				success: false,
			})
			return
		}

		// Check if story is expired
		if (story.expiresAt < new Date()) {
			res.status(404).json({
				message: "Story has expired",
				success: false,
			})
			return
		}

		res.status(200).json({
			message: "Story fetched successfully",
			success: true,
			story,
		})
	} catch (error) {
		console.error("Error fetching story:", error)
		res.status(500).json({
			message: "Internal server error",
			success: false,
		})
	}
}

// Add viewer to story
export const addStoryViewer = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id: storyId } = req.params
		const { id: userId } = req

		if (!userId) {
			res.status(401).json({
				message: "User not authenticated",
				success: false,
			})
			return
		}

		const story = await Story.findById(storyId)

		if (!story) {
			res.status(404).json({
				message: "Story not found",
				success: false,
			})
			return
		}

		// Check if story is expired
		if (story.expiresAt < new Date()) {
			res.status(404).json({
				message: "Story has expired",
				success: false,
			})
			return
		}

		// Add viewer if not already viewed
		if (!story.viewers.includes(userId as any)) {
			story.viewers.push(userId as any)
			await story.save()
		}

		res.status(200).json({
			message: "Story viewed successfully",
			success: true,
		})
	} catch (error) {
		console.error("Error adding story viewer:", error)
		res.status(500).json({
			message: "Internal server error",
			success: false,
		})
	}
}

// Delete story
export const deleteStory = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id: storyId } = req.params
		const { id: userId } = req

		const story = await Story.findById(storyId)

		if (!story) {
			res.status(404).json({
				message: "Story not found",
				success: false,
			})
			return
		}

		// Check if user is the author
		if (story.author.toString() !== userId) {
			res.status(403).json({
				message: "You can only delete your own stories",
				success: false,
			})
			return
		}

		// Delete image from cloudinary
		await cloudinary.uploader.destroy(story.image_public_id)

		// Delete story from database
		await Story.findByIdAndDelete(storyId)

		res.status(200).json({
			message: "Story deleted successfully",
			success: true,
		})
	} catch (error) {
		console.error("Error deleting story:", error)
		res.status(500).json({
			message: "Internal server error",
			success: false,
		})
	}
}
