"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Local imports
import PostHeader from "@/components/ui/post-header"
import PostActions from "@/components/ui/post-actions"
import CommentsDialog from "@/components/ui/comments-dialog"
import CommentInput from "@/components/ui/comment-input"
import UsersListDialog from "@/components/ui/users-list-dialog"
import { type Post } from "@/types/post"
import { usePostComments } from "@/hooks/usePostComments"
import { usePostLikes } from "@/hooks/usePostLikes"

const Post = ({ postData }: { postData: Post }) => {
	const [showHeartAnimation, setShowHeartAnimation] = useState(false)

	const { comments, addComment } = usePostComments(postData._id)

	const {
		liked,
		bookmarked,
		likesCount,
		bookmarksCount,
		toggleLike,
		toggleBookmark,
	} = usePostLikes(
		postData._id,
		postData.isBookmarked,
		postData.bookmarksCount,
		postData.likes
	)

	const handleDoubleClick = () => {
		if (!liked) toggleLike()
		setShowHeartAnimation(true)
		setTimeout(() => setShowHeartAnimation(false), 800)
	}

	if (!postData) return null

	return (
		<article className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 max-w-lg mx-auto">
			{/* Post Header */}
			<div className="p-4">
				<PostHeader
					username={postData.author.username}
					userAvatar={postData.author.image}
				/>
			</div>

			{/* Post Image */}
			<div
				className="relative aspect-square cursor-pointer"
				onDoubleClick={handleDoubleClick}
			>
				<Image
					src={postData.image}
					alt={`Post by ${postData.author.username}`}
					fill
					className="object-cover"
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
				/>

				{/* Heart Pop Animation */}
				<AnimatePresence>
					{showHeartAnimation && (
						<motion.div
							key="heart"
							className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
							initial={{ scale: 0, opacity: 0 }}
							animate={{
								scale: [0, 1.2, 0.95, 1.1, 1],
								opacity: [0, 1, 1, 1, 1, 0],
							}}
							exit={{ scale: 1, opacity: 0 }}
							transition={{ duration: 0.8, ease: "easeOut" }}
						>
							<Heart className="w-20 h-20 text-white fill-white drop-shadow-lg" />
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Post Actions */}
			<div className="p-4">
				<PostActions
					postData={{ ...postData, comments }}
					isLiked={liked}
					isBookmarked={bookmarked}
					likesCount={likesCount}
					bookmarksCount={bookmarksCount}
					onToggleLike={toggleLike}
					onToggleBookmark={toggleBookmark}
					postId={postData._id}
					hideLikesCount={true}
					hideCommentInput={true}
				/>

				{/* Post Info */}
				<div>
					<UsersListDialog postId={postData._id} type="likes" title="Likes">
						<div className="text-sm font-semibold text-gray-900 cursor-pointer hover:text-gray-700 transition-colors">
							{likesCount} likes
						</div>
					</UsersListDialog>

					<div className="mt-2">
						<span className="text-sm font-semibold text-gray-900 mr-2 cursor-pointer hover:text-blue-600 transition-colors">
							{postData.author.username}
						</span>
						<span className="text-sm text-gray-700">{postData.caption}</span>
					</div>

					{/* Comments Dialog */}
					{comments.length > 0 && (
						<CommentsDialog
							postData={{ ...postData, comments }}
							isLiked={liked}
							isBookmarked={bookmarked}
							likesCount={likesCount}
							bookmarksCount={bookmarksCount}
							toggleLike={toggleLike}
							toggleBookmark={toggleBookmark}
						>
							<button className="text-sm text-gray-500 hover:text-gray-700 mt-2 transition-colors cursor-pointer">
								View all {comments.length} comments
							</button>
						</CommentsDialog>
					)}

					{/* Comments Preview */}
					{comments && Array.isArray(comments) && comments.length > 0 && (
						<div className="mt-2 space-y-1">
							{comments.slice(0, 2).map((comment: any) => {
								if (typeof comment === "object" && comment._id) {
									return (
										<div key={comment._id} className="text-sm">
											<span className="font-semibold text-gray-900 mr-2 cursor-pointer hover:text-blue-600 transition-colors">
												{comment.author.username}
											</span>
											<span className="text-gray-700">{comment.text}</span>
										</div>
									)
								}
								return null
							})}
						</div>
					)}

					{/* Timestamp */}
					<div className="text-xs text-gray-400 mt-2 uppercase tracking-wide">
						2 hours ago
					</div>
				</div>

				{/* Comment Input */}
				<div className="mt-4 pt-4 border-t border-gray-100">
					<CommentInput postId={postData._id} addComment={addComment} />
				</div>
			</div>
		</article>
	)
}

export default Post
