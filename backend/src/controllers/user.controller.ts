import { type Request, type Response } from "express"
import User from "../models/user.model.js"
import cloudinary from "../config/cloudinary.js"
import { get_data_uri } from "../utils/data_uri.js"
import mongoose from "mongoose"
import Notification from "../models/notification.model.js"
import { auth } from "../auth/auth.js"
import { fromNodeHeaders } from "better-auth/node"
import { MongoServerError } from "mongodb"
import { APIError } from "better-auth"

export const get_profile = async (req: Request, res: Response) => {
	try {
		const current_user = await User.findById(req.id)
		if (!current_user) {
			res.status(401).json({ message: "Unauthorized", success: false })
			return
		}

		const identifier = req.params.identifier
		if (!identifier) {
			res.status(400).json({ message: "Identifier missing", success: false })
			return
		}
		let match: Record<string, any>

		if (mongoose.Types.ObjectId.isValid(identifier)) {
			match = { _id: new mongoose.Types.ObjectId(identifier) }
		} else {
			match = { username: identifier }
		}

		const user = await User.findOne(match)
			.select("-password -__v -bookmarks")
			.populate("followers", "username")
			.populate("following", "username")
			.lean()

		if (!user) {
			res.status(404).json({
				message: "User doesn't exist or account has been deleted",
				success: false,
			})
			return
		}

		// Check if current user is blocked by the profile user
		if (user.blocked_users?.includes(current_user._id)) {
			res.status(404).json({
				message: "User doesn't exist or account has been deleted",
				success: false,
			})
			return
		}

		// Check if profile user is blocked by current user
		const isBlocked = current_user.blocked_users?.includes(user._id) || false

		// Add blocked status to user data
		const userWithBlockStatus = {
			...user,
			isBlocked,
		}

		res.status(200).json({
			message: "User profile retrieved successfully",
			success: true,
			data: userWithBlockStatus,
		})
		return
	} catch (err) {
		console.error("Error getting user profile", err)
		res.status(500).json({ message: "Internal server error", success: false })
		return
	}
}

export const get_current_user = async (req: Request, res: Response) => {
	try {
		const user_id = req.id
		const user = await User.findById(user_id).lean()
		if (!user) {
			res.status(404).json({
				message: "User doesn't exist or account has been deleted",
				success: false,
			})
			return
		}
		res.status(200).json({
			message: "User retrieved successfully",
			success: true,
			data: {
				...user,
				followers: user.followers.length,
				following: user.following.length,
			},
		})
	} catch (err) {
		console.error("Error getting current user", err)
		res.status(500).json({ message: "Internal server error", success: false })
	}
}

export const edit_profile = async (req: Request, res: Response) => {
	try {
		const user_id = req.id
		const user = await User.findById(user_id)
		if (!user) {
			return res.status(404).json({ message: "Unauthorized", success: false })
		}
		const image = req.file
		let cloud_response
		if (image) {
			cloud_response = await cloudinary.uploader.upload(
				await get_data_uri(image),
				{
					public_id: `instagram-clone/users/${user_id}/image`,
					overwrite: true,
				}
			)
		}
		await auth.api.updateUser({
			headers: fromNodeHeaders(req.headers),
			body: {
				...req.body,
				...(cloud_response?.secure_url
					? { image: cloud_response.secure_url }
					: {}),
			},
		})

		if (req.body.currentPassword && req.body.newPassword) {
			await auth.api.changePassword({
				headers: fromNodeHeaders(req.headers),
				body: {
					currentPassword: req.body.currentPassword,
					newPassword: req.body.newPassword,
				},
			})
		}
		return res
			.status(200)
			.json({ message: "Profile updated successfully", success: true })
	} catch (err) {
		if (
			err instanceof MongoServerError &&
			err.name === "MongoServerError" &&
			err.code === 11000
		) {
			return res
				.status(400)
				.json({ message: "Username already taken", success: false })
		}
		if (err instanceof APIError) {
			if (err.body?.message === "Invalid password") {
				return res
					.status(400)
					.json({ message: "Invalid password", success: false })
			}
			if (err.body?.message === "Password too short") {
				return res
					.status(400)
					.json({ message: "Password too short", success: false })
			}
		}
		console.error("Error editing user profile", err)
		return res
			.status(500)
			.json({ message: "Internal server error", success: false })
	}
}

export const get_suggested_users = async (req: Request, res: Response) => {
	try {
		const current_user = await User.findById(req.id)
		if (!current_user) {
			return res.status(401).json({ message: "Unauthorized", success: false })
		}

		const limit = parseInt(req.query.limit as string) || 10

		const excluded = [
			current_user._id,
			...current_user.following,
			...current_user.blocked_users,
		]

		const users = await User.aggregate([
			// Step 1: Match only "friends of friends"
			{
				$match: {
					_id: { $nin: excluded },
					blocked_users: { $ne: current_user._id },
				},
			},

			// Step 2: Keep only users followed by current_user.following
			{
				$addFields: {
					mutualFollowCount: {
						$size: {
							$setIntersection: ["$followers", current_user.following],
						},
					},
				},
			},

			// Step 3: Only suggest if at least 1 mutual follower exists
			{
				$match: {
					mutualFollowCount: { $gt: 0 },
				},
			},

			// Step 4: Sort by strongest mutual connections
			{ $sort: { mutualFollowCount: -1 } },

			// Step 5: Limit results
			{ $limit: limit },

			// Step 6: Lookup mutual follower usernames
			{
				$lookup: {
					from: "user",
					localField: "followers",
					foreignField: "_id",
					as: "mutualFollowers",
					pipeline: [
						{
							$match: {
								_id: { $in: current_user.following }, // keep only mutuals
							},
						},
						{ $project: { username: 1 } },
					],
				},
			},
			{
				$project: {
					username: 1,
					image: 1,
					bio: 1,
					emailVerified: 1,
					followedBy: "$mutualFollowers.username", // mutual usernames
					isFollowing: { $literal: false }, // keep shape same as frontend expects
				},
			},
		])

		return res.status(200).json({
			message: "Suggested users retrieved successfully",
			data: users,
			success: true,
		})
	} catch (err) {
		console.error("Error getting suggested users", err)
		return res
			.status(500)
			.json({ message: "Internal server error", success: false })
	}
}

export const toggle_follow_user = async (req: Request, res: Response) => {
	try {
		const current_user_id = req.id
		const current_user = await User.findById(current_user_id)
		if (!current_user) {
			return res.status(401).json({ message: "Unauthorized", success: false })
		}

		const identifier = req.params.identifier
		if (!identifier)
			return void res
				.status(400)
				.json({ message: "Identifier missing", success: false })

		let target_user: any

		if (mongoose.Types.ObjectId.isValid(identifier)) {
			target_user = await User.findById(identifier)
		} else {
			target_user = await User.findOne({ username: identifier })
		}

		if (!target_user)
			return void res
				.status(404)
				.json({ message: "User not found", success: false })

		if (current_user._id.equals(target_user._id)) {
			return void res.status(400).json({
				message: "You cannot follow/unfollow yourself",
				success: false,
			})
		}

		const has_followed = current_user.following.includes(target_user._id)

		if (has_followed) {
			await User.updateOne(
				{ _id: current_user._id },
				{ $pull: { following: target_user._id } }
			)
			await User.updateOne(
				{ _id: target_user._id },
				{ $pull: { followers: current_user._id } }
			)
			await Notification.deleteOne({
				type: "follow",
				from: current_user._id,
				to: target_user._id,
			})
			return void res
				.status(200)
				.json({ message: "User unfollowed successfully", success: true })
		} else {
			await User.updateOne(
				{ _id: current_user._id },
				{ $addToSet: { following: target_user._id } }
			)
			await User.updateOne(
				{ _id: target_user._id },
				{ $addToSet: { followers: current_user._id } }
			)
			await Notification.create({
				type: "follow",
				from: current_user._id,
				to: target_user._id,
			})
			return void res
				.status(200)
				.json({ message: "User followed successfully", success: true })
		}
	} catch (err) {
		console.error("Error toggling follow user", err)
		return void res
			.status(500)
			.json({ message: "Internal server error", success: false })
	}
}

export const search_users = async (req: Request, res: Response) => {
	try {
		const current_user = await User.findById(req.id)
		if (!current_user) {
			return res.status(401).json({ message: "Unauthorized", success: false })
		}

		const query = req.query.q as string
		if (!query || query.trim().length === 0) {
			return res.status(400).json({
				message: "Search query is required",
				success: false,
			})
		}

		const limit = parseInt(req.query.limit as string) || 20
		const trimmedQuery = query.trim()

		const users = await User.find({
			$and: [
				{ _id: { $ne: current_user._id } },
				{ _id: { $nin: current_user.blocked_users } },
				{ blocked_users: { $ne: current_user._id } },
				{
					$or: [
						{ username: { $regex: trimmedQuery, $options: "i" } },
						{ bio: { $regex: trimmedQuery, $options: "i" } },
					],
				},
			],
		})
			.select("username image bio emailVerified followers")
			.limit(limit)
			.lean()

		const usersWithMetadata = users.map((user) => ({
			...user,
			followersCount: user.followers.length,
			isFollowing: current_user.following.includes(user._id),
			followers: undefined,
		}))

		res.status(200).json({
			message: "Users retrieved successfully",
			success: true,
			data: usersWithMetadata,
		})
		return
	} catch (err) {
		console.error("Error searching users", err)
		res.status(500).json({ message: "Internal server error", success: false })
		return
	}
}

export const block_user = async (req: Request, res: Response) => {
	try {
		const current_user_id = req.id
		const { identifier } = req.params

		if (!identifier) {
			return res.status(400).json({
				message: "User identifier is required",
				success: false,
			})
		}

		// Find the user to block - check if identifier is valid ObjectId first
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

		const user_to_block = await User.findOne(match)

		if (!user_to_block) {
			return res.status(404).json({
				message: "User not found",
				success: false,
			})
		}

		// Can't block yourself
		if (user_to_block._id.toString() === current_user_id) {
			return res.status(400).json({
				message: "You cannot block yourself",
				success: false,
			})
		}

		// Find current user
		const current_user = await User.findById(current_user_id)
		if (!current_user) {
			return res.status(401).json({
				message: "Unauthorized",
				success: false,
			})
		}

		// Check if already blocked
		if (current_user.blocked_users.includes(user_to_block._id)) {
			return res.status(400).json({
				message: "User is already blocked",
				success: false,
			})
		}

		// Block the user
		await User.findByIdAndUpdate(current_user_id, {
			$addToSet: { blocked_users: user_to_block._id },
			$pull: {
				following: user_to_block._id,
				followers: user_to_block._id,
			},
		})

		// Remove current user from blocked user's followers/following
		await User.findByIdAndUpdate(user_to_block._id, {
			$pull: {
				following: current_user_id,
				followers: current_user_id,
			},
		})

		res.status(200).json({
			message: `@${user_to_block.username} has been blocked`,
			success: true,
		})
		return
	} catch (err) {
		console.error("Error blocking user", err)
		res.status(500).json({
			message: "Internal server error",
			success: false,
		})
		return
	}
}

export const unblock_user = async (req: Request, res: Response) => {
	try {
		const current_user_id = req.id
		const { identifier } = req.params

		if (!identifier) {
			return res.status(400).json({
				message: "User identifier is required",
				success: false,
			})
		}

		// Find the user to unblock - check if identifier is valid ObjectId first
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

		const user_to_unblock = await User.findOne(match)

		if (!user_to_unblock) {
			return res.status(404).json({
				message: "User not found",
				success: false,
			})
		}

		// Find current user
		const current_user = await User.findById(current_user_id)
		if (!current_user) {
			return res.status(401).json({
				message: "Unauthorized",
				success: false,
			})
		}

		// Check if user is actually blocked
		if (!current_user.blocked_users.includes(user_to_unblock._id)) {
			return res.status(400).json({
				message: "User is not blocked",
				success: false,
			})
		}

		// Unblock the user
		await User.findByIdAndUpdate(current_user_id, {
			$pull: { blocked_users: user_to_unblock._id },
		})

		res.status(200).json({
			message: `@${user_to_unblock.username} has been unblocked`,
			success: true,
		})
		return
	} catch (err) {
		console.error("Error unblocking user", err)
		res.status(500).json({
			message: "Internal server error",
			success: false,
		})
		return
	}
}

export const get_user_followers = async (req: Request, res: Response) => {
	try {
		const { identifier } = req.params
		const current_user_id = req.id

		if (!identifier) {
			return res.status(400).json({
				message: "User identifier is required",
				success: false,
			})
		}

		// Find the user whose followers we want
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

		const user = await User.findOne(match)
		if (!user) {
			return res.status(404).json({
				message: "User not found",
				success: false,
			})
		}

		const current_user = await User.findById(current_user_id)
		if (!current_user) {
			return res.status(401).json({
				message: "Unauthorized",
				success: false,
			})
		}

		// Get followers excluding blocked users
		const followers = await User.find({
			_id: { $in: user.followers, $nin: current_user.blocked_users },
			blocked_users: { $ne: current_user_id },
		})
			.select("username full_name image emailVerified")
			.lean()

		// 🔥 Create a Set for O(1) lookup
		const followingSet = new Set(
			current_user.following.map((id) => id.toString())
		)

		// Add following status efficiently
		const followersWithStatus = followers.map((follower) => ({
			...follower,
			isFollowing: followingSet.has(follower._id.toString()),
		}))

		res.status(200).json({
			message: "Followers retrieved successfully",
			data: followersWithStatus,
			success: true,
		})
		return
	} catch (err) {
		console.error("Error getting user followers", err)
		res.status(500).json({
			message: "Internal server error",
			success: false,
		})
		return
	}
}

export const is_following = async (req: Request, res: Response) => {
	try {
		const { identifier } = req.params as { identifier: string }
		const current_user_id = req.id
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
		const user = await User.findOne(match)
		if (!user) {
			return res.status(404).json({ message: "User not found", success: false })
		}
		const current_user = await User.findById(current_user_id)
		if (!current_user) {
			return res.status(401).json({ message: "Unauthorized", success: false })
		}
		const isFollowing = current_user.following.includes(user._id)
		return res
			.status(200)
			.json({ message: "success", success: true, data: isFollowing })
	} catch (err) {
		console.error("Error checking following status", err)
		return res
			.status(500)
			.json({ message: "Internal server error", success: false })
	}
}

export const get_user_following = async (req: Request, res: Response) => {
	try {
		const { identifier } = req.params as { identifier: string }
		const current_user_id = req.id

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

		const user = await User.findOne(match)

		if (!user) {
			return res.status(404).json({
				message: "User not found",
				success: false,
			})
		}

		const current_user = await User.findById(current_user_id)
		if (!current_user) {
			return res.status(401).json({
				message: "Unauthorized",
				success: false,
			})
		}

		// Get following excluding blocked users
		const following = await User.find({
			_id: { $in: user.following, $nin: current_user.blocked_users },
			blocked_users: { $ne: current_user_id },
		})
			.select("username full_name image emailVerified")
			.lean()

		// Add following status for each user being followed
		const followingWithStatus = following.map((followedUser) => ({
			...followedUser,
			isFollowing: current_user.following.includes(followedUser._id),
		}))

		res.status(200).json({
			message: "Following retrieved successfully",
			data: followingWithStatus,
			success: true,
		})
		return
	} catch (err) {
		console.error("Error getting user following", err)
		res.status(500).json({
			message: "Internal server error",
			success: false,
		})
		return
	}
}
