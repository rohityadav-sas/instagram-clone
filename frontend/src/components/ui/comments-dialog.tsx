"use client"

import { useState } from "react"
import { Heart, MessageSquare, MoreHorizontal } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import PostActions from "@/components/ui/post-actions"
import UserProfile from "@/components/ui/user-profile"
import { type Post } from "@/types/post"
import { type Comment } from "@/types/comment"
import { usePostComments } from "@/hooks/usePostComments"
import { DialogClose } from "@radix-ui/react-dialog"
import axios_instance from "@/config/axios"
import toast from "react-hot-toast"
import { useQuery, useQueryClient } from "@tanstack/react-query"

interface CommentsDialogProps {
	postData: Post
	children: React.ReactNode
	isLiked: boolean
	isBookmarked: boolean
	setLiked?: React.Dispatch<React.SetStateAction<boolean>>
	likesCount: number
	bookmarksCount: number
	toggleLike: () => void
	toggleBookmark: () => void
}

const CommentsDialog = ({
	postData,
	children,
	isLiked,
	isBookmarked,
	setLiked,
	likesCount,
	bookmarksCount,
	toggleLike,
	toggleBookmark,
}: CommentsDialogProps) => {
	const [showHeartAnimation, setShowHeartAnimation] = useState(false)
	const [dialogOpen, setDialogOpen] = useState(false)
	const [moreOpen, setMoreOpen] = useState(false)
	const [isFollowing, setIsFollowing] = useState(false)
	const { comments, addComment } = usePostComments(postData._id)

	const handleDoubleClick = () => {
		if (!isLiked) {
			toggleLike()
			setLiked?.(true)
		}
		setShowHeartAnimation(true)
		setTimeout(() => setShowHeartAnimation(false), 800)
	}

	const queryClient = useQueryClient()

	useQuery({
		queryKey: ["dialog-data"],
		queryFn: async () => {
			const { data } = await axios_instance.get(
				"/users/is-following/" + postData.author.username
			)
			setIsFollowing(data.data)
			return data.data
		},
		enabled: dialogOpen,
	})

	const unfollowPostAuthor = () => {
		const unfollow = async () => {
			const { data } = await axios_instance.post(
				"/users/toggle-follow/" + postData.author.username
			)

			if (!data.success)
				throw new Error(data.message || "Failed to toggle follow")

			setMoreOpen(false)
			setIsFollowing((x) => !x)
		}

		toast.promise(unfollow(), {
			loading: isFollowing ? "Unfollowing..." : "Following...",
			success: () => {
				queryClient.invalidateQueries({
					queryKey: ["profile", postData.author.username],
				})
				return isFollowing ? "Unfollowed successfully" : "Followed successfully"
			},
			error: (err) => err.message || "Failed to toggle follow",
		})
	}

	const deletePost = () => {
		const deletePost = async () => {
			const { data } = await axios_instance.post(
				"/posts/delete/" + postData._id
			)
			if (!data.success)
				throw new Error(data.message || "Failed to delete post")
			setMoreOpen(false)
		}
		toast.promise(deletePost(), {
			loading: "Deleting post...",
			success: () => {
				queryClient.invalidateQueries({
					queryKey: ["profile-posts", postData.author.username],
				})
				return "Post deleted successfully"
			},
			error: (err) => err.message || "Failed to delete post",
		})
	}

	return (
		<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent
				className="p-0 gap-0 text-xs md:text-xs lg:text-sm"
				style={{ width: "70vw", maxWidth: "1200px", height: "40vw" }}
			>
				<DialogTitle className="sr-only">Comments</DialogTitle>

				<div className="flex h-[40vw]">
					{/* Post Image */}
					<div
						className="relative bg-gray-200 w-1/2 bg-cover bg-center bg-no-repeat rounded-tl-md rounded-bl-md cursor-pointer"
						style={{ backgroundImage: `url(${postData.image})` }}
						onDoubleClick={handleDoubleClick}
					>
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

					{/* Comments Section */}
					<div className="flex-1 flex flex-col border-l">
						{/* Post Header */}
						<div className="p-4 border-b flex justify-between gap-2">
							<UserProfile
								username={postData.author.username}
								image={postData.author.image}
								emailVerified={postData.author.emailVerified}
								avatarSize={35}
								text={postData.caption}
								textCreatedAt={new Date(postData.createdAt).toLocaleString()}
							/>
							<Dialog open={moreOpen} onOpenChange={setMoreOpen}>
								<DialogTrigger asChild>
									<MoreHorizontal className="w-6 mr-10 h-6 text-gray-600 cursor-pointer hover:text-gray-800 transition-colors" />
								</DialogTrigger>
								<DialogContent className="rounded-lg shadow-lg p-0 overflow-hidden bg-white [&>button]:hidden">
									<DialogTitle className="sr-only">More Options</DialogTitle>
									<div className="flex flex-col divide-y divide-gray-200">
										<p
											className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors text-center"
											onClick={unfollowPostAuthor}
										>
											{isFollowing ? "Unfollow" : "Follow"}
										</p>
										<p
											className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors text-center"
											onClick={deletePost}
										>
											Delete
										</p>
										<DialogClose>
											<p className="px-4 py-3 text-red-500 hover:bg-red-50 cursor-pointer transition-colors font-semibold">
												Cancel
											</p>
										</DialogClose>
									</div>
								</DialogContent>
							</Dialog>
						</div>

						{/* Comments Header */}
						<div className="px-4 py-2 border-b flex items-center justify-between">
							<div className="flex items-center gap-3 p-1 py-3">
								<MessageSquare className="w-5 h-5 text-gray-600" />
								<h3 className="font-semibold text-base">
									Comments •{" "}
									<span className="font-normal">{comments?.length || 0}</span>
								</h3>
							</div>
						</div>

						{/* Post Caption + Comments */}
						<div className="flex-1 overflow-y-auto">
							{/* Comments */}
							<div className="space-y-4 p-4 pt-2">
								{comments?.map((comment: Comment) => {
									if (typeof comment !== "object" || !comment._id) return null
									return (
										<div key={comment._id} className="flex gap-2 items-center">
											<UserProfile
												username={comment.author.username}
												image={comment.author.image}
												emailVerified={comment.author.emailVerified}
												avatarSize={35}
												text={comment.text}
												textCreatedAt={new Date(
													comment.createdAt
												).toLocaleString()}
											/>
										</div>
									)
								})}
							</div>
						</div>
						{/* Post Actions + Likes + Comment Input */}
						<div className="border-t p-4">
							<PostActions
								isLiked={isLiked}
								isBookmarked={isBookmarked}
								likesCount={likesCount}
								bookmarksCount={bookmarksCount}
								onToggleLike={toggleLike}
								onToggleBookmark={toggleBookmark}
								addComment={addComment}
								postId={postData._id}
							/>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default CommentsDialog
