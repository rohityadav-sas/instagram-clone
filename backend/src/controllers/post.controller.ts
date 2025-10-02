import { type Request, type Response } from "express"
import User from "../models/user.model.js"
import Post from "../models/post.model.js"
import cloudinary from "../config/cloudinary.js"
import { get_data_uri } from "../utils/data_uri.js"
import Comment from "../models/comment.model.js"
import Notification from "../models/notification.model.js"
import mongoose from "mongoose"

export const create_post = async (req: Request, res: Response) => {
	try {
		const author = await User.findById(req.id)
		if (!author) {
			res.status(404).json({ message: "User not found", success: false })
			return
		}
		const { caption } = req.body
		if (!req.file) {
			res.status(400).json({ message: "Image is required", success: false })
			return
		}

		const response_url = await cloudinary.uploader.upload(
			await get_data_uri(req.file),
			{
				folder: "posts",
			}
		)
		await Post.create({
			caption,
			image: response_url.secure_url,
			image_public_id: response_url.public_id,
			author: req.id,
		})
		res.status(201).json({ message: "Post created", success: true })
	} catch (err: any) {
		console.error("Error creating post", err)
		res
			.status(500)
			.json({ message: err.message || "Internal server error", success: false })
	}
}

export const delete_post = async (req: Request, res: Response) => {
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
		if (post.author._id.toString() !== req.id) {
			res
				.status(403)
				.json({ message: "You are not the owner of this post", success: false })
			return
		}
		await post.deleteOne()
		res.status(200).json({ message: "Post deleted", success: true })
		await cloudinary.uploader.destroy(post.image_public_id)
		await Comment.deleteMany({ post: post._id })
	} catch (err) {
		console.error("Error deleting post", err)
		res.status(500).json({ message: "Internal server error", success: false })
	}
}

export const toggle_like_post = async (req: Request, res: Response) => {
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
		const has_liked = post.likes.includes(current_user._id)
		if (has_liked) {
			await Post.updateOne(
				{ _id: post._id },
				{ $pull: { likes: current_user._id } }
			)
			await Notification.deleteOne({
				to: post.author,
				from: current_user._id,
				type: "like",
				post: post._id,
			})

			res.status(200).json({ message: "Post unliked", success: true })
		} else {
			await Post.updateOne(
				{ _id: post._id },
				{ $addToSet: { likes: current_user._id } }
			)
			if (post.author.toString() !== current_user._id.toString()) {
				await Notification.create({
					to: post.author,
					from: current_user._id,
					type: "like",
					post: post._id,
				})
			}
			res.status(200).json({ message: "Post liked", success: true })
		}
	} catch (err) {
		console.error("Error toggling like on post", err)
		res.status(500).json({ message: "Internal server error", success: false })
	}
}

export const toggle_bookmark_post = async (req: Request, res: Response) => {
	try {
		const current_user = await User.findById(req.id)
		if (!current_user)
			return void res
				.status(401)
				.json({ message: "Unauthorized", success: false })

		const post = await Post.findById(req.params.post_id)
		if (!post)
			return void res
				.status(404)
				.json({ message: "Post not found", success: false })

		const has_bookmarked = current_user.bookmarks.includes(post._id)
		if (has_bookmarked) {
			await User.updateOne(
				{ _id: current_user._id },
				{ $pull: { bookmarks: post._id } }
			)
			res.status(200).json({ message: "Post unbookmarked", success: true })
		} else {
			await User.updateOne(
				{ _id: current_user._id },
				{ $addToSet: { bookmarks: post._id } }
			)
			res.status(200).json({ message: "Post bookmarked", success: true })
		}
	} catch (err) {
		console.error("Error bookmarking post", err)
		res.status(500).json({ message: "Internal server error", success: false })
	}
}

export const get_user_posts = async (req: Request, res: Response) => {
	try {
		const current_user = await User.findById(req.id)
		if (!current_user) {
			return res.status(401).json({ message: "Unauthorized", success: false })
		}

		const username = req.params.username
		const user = await User.findOne({ username }).select("_id blocked_users")
		if (!user) {
			return res.status(404).json({ message: "User not found", success: false })
		}

		// Check if the profile user has blocked the current user
		if (user.blocked_users?.includes(current_user._id)) {
			return res.status(404).json({ message: "User not found", success: false })
		}

		// Check if current user has blocked the profile user
		if (current_user.blocked_users?.includes(user._id)) {
			return res.status(404).json({ message: "User not found", success: false })
		}

		let query: any = { author: user._id }
		const limit = parseInt(req.query.limit as string) || 10
		const last_created_at = req.query.lastCreatedAt as string | undefined
		if (last_created_at) query.createdAt = { $lt: new Date(last_created_at) }

		const posts = await Post.find(query)
			.sort({ createdAt: -1 })
			.limit(limit + 1)
			.select("_id image caption author likes createdAt")
			.populate("author", "username image emailVerified")
			.populate("likes", "username image emailVerified")
			.lean()

		const postIds = posts.map((p) => p._id)

		// 1️⃣ Get comment counts per post
		const commentsCount = await Comment.aggregate([
			{ $match: { post: { $in: postIds } } },
			{ $group: { _id: "$post", count: { $sum: 1 } } },
		])
		const countsMap = commentsCount.reduce((acc, curr) => {
			acc[curr._id.toString()] = curr.count
			return acc
		}, {} as Record<string, number>)

		// 2️⃣ Get bookmarks count per post
		const bookmarkCounts = await User.aggregate([
			{ $unwind: "$bookmarks" },
			{ $match: { bookmarks: { $in: postIds } } },
			{ $group: { _id: "$bookmarks", count: { $sum: 1 } } },
		])
		const bookmarkMap = bookmarkCounts.reduce((acc, b) => {
			acc[b._id.toString()] = b.count
			return acc
		}, {} as Record<string, number>)

		// 3️⃣ Combine into final posts array
		const postsWithCounts = posts.map((post) => ({
			...post,
			commentsCount: countsMap[post._id.toString()] || 0,
			isBookmarked: current_user.bookmarks.includes(post._id),
			bookmarksCount: bookmarkMap[post._id.toString()] || 0,
		}))

		const has_more = posts.length > limit
		if (has_more) postsWithCounts.pop()

		const next_cursor = has_more
			? postsWithCounts[postsWithCounts.length - 1]?.createdAt
			: null

		return res.status(200).json({
			message: "User posts retrieved successfully",
			data: {
				posts: postsWithCounts,
				pagination: {
					has_more,
					next_cursor,
				},
			},
			success: true,
		})
	} catch (err) {
		console.error("Error getting user posts", err)
		return res
			.status(500)
			.json({ message: "Internal server error", success: false })
	}
}

export const get_explore_posts = async (req: Request, res: Response) => {
	try {
		const current_user = await User.findById(req.id)
		if (!current_user) {
			return void res
				.status(401)
				.json({ message: "Unauthorized", success: false })
		}

		const limit = parseInt(req.query.limit as string) || 10
		const lastCreatedAt = req.query.lastCreatedAt as string | undefined

		// Exclude own posts + followed users' posts + blocked users + users who blocked current user
		const excludedAuthors = [
			current_user._id,
			...current_user.following,
			...current_user.blocked_users,
		]

		const matchStage: any = {
			author: { $nin: excludedAuthors },
		}
		if (lastCreatedAt) {
			matchStage.createdAt = { $lt: new Date(lastCreatedAt) }
		}

		const posts = await Post.aggregate([
			{ $match: matchStage },

			// Lookup comments
			{
				$lookup: {
					from: "comments",
					localField: "_id",
					foreignField: "post",
					as: "comments",
				},
			},
			{ $addFields: { commentsCount: { $size: "$comments" } } },

			// Lookup users who bookmarked the post to get bookmarksCount
			{
				$lookup: {
					from: "users",
					localField: "_id",
					foreignField: "bookmarks",
					as: "bookmarkUsers",
				},
			},
			{
				$addFields: {
					bookmarksCount: { $size: "$bookmarkUsers" },
					isBookmarked: { $in: [current_user._id, "$bookmarkUsers._id"] },
				},
			},

			// Lookup author and filter out users who blocked current user
			{
				$lookup: {
					from: "user",
					localField: "author",
					foreignField: "_id",
					as: "author",
				},
			},
			{ $unwind: "$author" },

			// Filter out users who blocked current user
			{
				$match: {
					"author.blocked_users": { $ne: current_user._id },
				},
			},

			// Project required fields
			{
				$project: {
					_id: 1,
					caption: 1,
					image: 1,
					createdAt: 1,
					commentsCount: 1,
					bookmarksCount: 1,
					isBookmarked: 1,

					author: {
						username: "$author.username",
						image: "$author.image",
						emailVerified: "$author.emailVerified",
					},

					likes: {
						$map: {
							input: "$likes",
							as: "likeUser",
							in: {
								username: "$$likeUser.username",
								image: "$$likeUser.image",
								emailVerified: "$$likeUser.emailVerified",
							},
						},
					},

					comments: {
						$map: {
							input: "$comments",
							as: "comment",
							in: {
								_id: "$$comment._id",
								text: "$$comment.text",
								createdAt: "$$comment.createdAt",
								post: { _id: "$$comment.post" },
								likes: {
									$map: {
										input: "$$comment.likes",
										as: "clike",
										in: {
											username: "$$clike.username",
											image: "$$clike.image",
											emailVerified: "$$clike.emailVerified",
										},
									},
								},
								author: {
									username: "$$comment.author.username",
									image: "$$comment.author.image",
									emailVerified: "$$comment.author.emailVerified",
								},
							},
						},
					},
				},
			},

			// Sort (recency)
			{ $sort: { createdAt: -1 } },

			{ $limit: limit },
		])

		res.status(200).json({
			message: "Explore posts retrieved successfully",
			data: posts,
			success: true,
		})
	} catch (err) {
		console.error("Error getting explore posts", err)
		res.status(500).json({ message: "Internal server error", success: false })
	}
}

export const search_posts = async (req: Request, res: Response) => {
	try {
		const current_user = await User.findById(req.id)
		if (!current_user) {
			return res.status(401).json({ message: "Unauthorized", success: false })
		}

		const query = (req.query.q as string)?.trim()
		if (!query) {
			return res
				.status(400)
				.json({ message: "Search query is required", success: false })
		}

		const limit = parseInt(req.query.limit as string) || 20

		// Search posts by caption with regex (case-insensitive)
		const posts = await Post.find({
			caption: { $regex: query, $options: "i" },
			author: { $nin: [...current_user.blocked_users, current_user._id] },
		})
			.populate({
				path: "author",
				select: "username image emailVerified blocked_users",
				match: { blocked_users: { $ne: current_user._id } },
			})
			.populate("likes", "username image emailVerified")
			.sort({ createdAt: -1 })
			.limit(limit)
			.lean()

		// Filter out posts where author blocked current user
		const filteredPosts = posts.filter((post) => post.author !== null)

		const postIds = filteredPosts.map((post) => post._id)

		// 1️⃣ Get comment counts per post
		const commentsCount = await Comment.aggregate([
			{ $match: { post: { $in: postIds } } },
			{ $group: { _id: "$post", count: { $sum: 1 } } },
		])
		const countsMap = commentsCount.reduce((acc, curr) => {
			acc[curr._id.toString()] = curr.count
			return acc
		}, {} as Record<string, number>)

		// 2️⃣ Get bookmark counts per post
		const bookmarkCounts = await User.aggregate([
			{ $unwind: "$bookmarks" },
			{ $match: { bookmarks: { $in: postIds } } },
			{ $group: { _id: "$bookmarks", count: { $sum: 1 } } },
		])
		const bookmarkMap = bookmarkCounts.reduce((acc, b) => {
			acc[b._id.toString()] = b.count
			return acc
		}, {} as Record<string, number>)

		// 3️⃣ Combine into final posts array
		const postsWithCounts = filteredPosts.map((post) => ({
			...post,
			commentsCount: countsMap[post._id.toString()] || 0,
			likesCount: post.likes.length,
			isBookmarked: current_user.bookmarks.includes(post._id),
			bookmarksCount: bookmarkMap[post._id.toString()] || 0,
		}))

		return res.status(200).json({
			message: "Posts retrieved successfully",
			success: true,
			data: postsWithCounts,
		})
	} catch (err) {
		console.error("Error searching posts", err)
		return res
			.status(500)
			.json({ message: "Internal server error", success: false })
	}
}

export const get_feed_posts = async (req: Request, res: Response) => {
	try {
		const current_user = await User.findById(req.id)
		if (!current_user) {
			res.status(401).json({ message: "Unauthorized", success: false })
			return
		}

		const page = parseInt(req.query.page as string) || 1
		const limit = parseInt(req.query.limit as string) || 10
		const skip = (page - 1) * limit

		// Get posts from users that the current user follows
		// Exclude current user's own posts from the feed
		// Exclude posts from blocked users and users who blocked current user
		const followingIds = current_user.following.filter(
			(userId: any) => !current_user.blocked_users.includes(userId)
		)

		const posts = await Post.find({
			author: {
				$in: followingIds,
				$nin: current_user.blocked_users,
			},
		})
			.populate({
				path: "author",
				select: "username image emailVerified blocked_users",
				match: { blocked_users: { $ne: current_user._id } },
			})
			.populate("likes", "username image emailVerified")
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean()

		// add isBoomarked field to each post

		// Get comment counts for each post
		const postIds = posts.map((post) => post._id)
		const comments = await Comment.find({ post: { $in: postIds } })
			.populate("author", "username image emailVerified")
			.sort({ createdAt: 1 })
			.lean()

		// Group comments by post
		const commentsMap = comments.reduce((acc, comment) => {
			const postId = comment.post.toString()
			if (!acc[postId]) acc[postId] = []
			acc[postId].push(comment)
			return acc
		}, {} as Record<string, any[]>)

		// Count bookmarks for all posts in one query
		const bookmarkCounts = await User.aggregate([
			{ $unwind: "$bookmarks" },
			{ $match: { bookmarks: { $in: postIds } } },
			{ $group: { _id: "$bookmarks", count: { $sum: 1 } } },
		])

		// Convert to a lookup map
		const bookmarkMap = bookmarkCounts.reduce((acc, b) => {
			acc[b._id.toString()] = b.count
			return acc
		}, {} as Record<string, number>)

		const postsWithComments = posts.map((post) => ({
			...post,
			comments: commentsMap[post._id.toString()] || [],
			commentsCount: (commentsMap[post._id.toString()] || []).length,
			isBookmarked: current_user.bookmarks.includes(post._id),
			bookmarksCount: bookmarkMap[post._id.toString()] || 0,
		}))

		// Check if there are more posts
		const totalPosts = await Post.countDocuments({
			author: { $in: followingIds },
		})
		const hasMore = skip + posts.length < totalPosts

		res.status(200).json({
			message: "Feed posts retrieved successfully",
			success: true,
			data: postsWithComments,
			pagination: {
				page,
				limit,
				hasMore,
				total: totalPosts,
			},
		})
	} catch (err) {
		console.error("Error fetching feed posts", err)
		res.status(500).json({ message: "Internal server error", success: false })
	}
}

export const get_post_likes = async (req: Request, res: Response) => {
	try {
		const current_user_id = req.id
		const { post_id } = req.params

		if (!post_id) {
			return res.status(400).json({
				message: "Post ID is required",
				success: false,
			})
		}

		// Find the post
		const post = await Post.findById(post_id)

		if (!post) {
			return res.status(404).json({
				message: "Post not found",
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

		// Get users who liked the post excluding blocked users
		const likes = await User.find({
			$and: [
				{ _id: { $in: post.likes } },
				{ blocked_users: { $ne: current_user_id } },
				{ _id: { $nin: current_user.blocked_users } },
			],
		})
			.select("username full_name image emailVerified")
			.lean()

		// Add following status for each user who liked
		const likesWithStatus = likes.map((user) => ({
			...user,
			isFollowing: current_user.following.includes(user._id),
		}))

		res.status(200).json({
			message: "Post likes retrieved successfully",
			data: likesWithStatus,
			success: true,
		})
		return
	} catch (err) {
		console.error("Error getting post likes", err)
		res.status(500).json({
			message: "Internal server error",
			success: false,
		})
		return
	}
}

export const get_bookmarked_posts = async (req: Request, res: Response) => {
	try {
		const current_user_id = req.id

		// Find the current user
		const current_user = await User.findById(current_user_id).lean()
		if (!current_user) {
			return res.status(401).json({
				message: "Unauthorized",
				success: false,
			})
		}

		const bookmarkIds = current_user.bookmarks.map(
			(id) => new mongoose.Types.ObjectId(id)
		)

		const bookmarked_posts = await Post.aggregate([
			{ $match: { _id: { $in: bookmarkIds } } },

			// Add a field that reflects the index in the user's bookmarks array
			{
				$addFields: {
					bookmarkIndex: { $indexOfArray: [current_user.bookmarks, "$_id"] },
					isBookmarked: true,
				},
			},

			// Lookup bookmark counts
			{
				$lookup: {
					from: "user",
					let: { postId: "$_id" },
					pipeline: [
						{ $match: { $expr: { $in: ["$$postId", "$bookmarks"] } } },
						{ $count: "count" },
					],
					as: "bookmarkData",
				},
			},
			{
				$addFields: {
					bookmarksCount: {
						$ifNull: [{ $arrayElemAt: ["$bookmarkData.count", 0] }, 0],
					},
				},
			},

			// Lookup comments for commentsCount
			{
				$lookup: {
					from: "comments",
					localField: "_id",
					foreignField: "post",
					as: "comments",
				},
			},
			{ $addFields: { commentsCount: { $size: "$comments" } } },

			// Populate author
			{
				$lookup: {
					from: "user",
					localField: "author",
					foreignField: "_id",
					as: "author",
				},
			},
			{ $unwind: "$author" },

			// Populate likes
			{
				$lookup: {
					from: "user",
					localField: "likes",
					foreignField: "_id",
					as: "likes",
				},
			},

			// Project final fields properly
			{
				$project: {
					_id: 1,
					image: 1,
					caption: 1,
					createdAt: 1,
					bookmarksCount: 1,
					isBookmarked: 1,
					commentsCount: 1,
					bookmarkIndex: 1, // keep for sorting

					author: {
						username: "$author.username",
						image: "$author.image",
						emailVerified: "$author.emailVerified",
					},

					likes: {
						$map: {
							input: "$likes",
							as: "likeUser",
							in: {
								_id: "$$likeUser._id",
								username: "$$likeUser.username",
								image: "$$likeUser.image",
								emailVerified: "$$likeUser.emailVerified",
							},
						},
					},
				},
			},

			// Sort by bookmarkIndex descending so last bookmarked comes first
			{ $sort: { bookmarkIndex: -1 } },
		])

		return res.status(200).json({
			message: "Bookmarked posts retrieved successfully",
			success: true,
			data: bookmarked_posts,
		})
	} catch (err) {
		console.error("Error getting bookmarked posts", err)
		return res.status(500).json({
			message: "Internal server error",
			success: false,
		})
	}
}
