import React from "react"
import CommentsDialog from "./comments-dialog"
import Image from "next/image"
import { Heart, MessageCircle } from "lucide-react"
import { usePostLikes } from "@/hooks/usePostLikes"
import { Post } from "@/types/post"

const PostGridItem = ({ post }: { post: Post }) => {
	const {
		liked,
		bookmarked,
		likesCount,
		bookmarksCount,
		toggleBookmark,
		toggleLike,
	} = usePostLikes(post._id, post.isBookmarked, post.bookmarksCount, post.likes)

	return (
		<CommentsDialog
			key={post._id}
			postData={post}
			isLiked={liked}
			isBookmarked={bookmarked}
			likesCount={likesCount}
			bookmarksCount={bookmarksCount}
			toggleLike={toggleLike}
			toggleBookmark={toggleBookmark}
		>
			<div className="aspect-square relative cursor-pointer group">
				<Image
					src={post.image}
					alt="Explore post"
					fill
					sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
					className="object-cover rounded-md"
				/>

				{/* Hover overlay */}
				<div className="absolute group inset-0 hover:bg-black/40 transition-all duration-200 rounded-md flex items-center justify-center">
					<div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center">
						<div className="flex items-center gap-4">
							<span className="flex items-center gap-1">
								<Heart className="w-5 h-5 fill-current" />{" "}
								{post.likes ? post.likes.length : 0}
							</span>
							<span className="flex items-center gap-1">
								<MessageCircle className="w-5 h-5 fill-current" />{" "}
								{post.commentsCount ? post.commentsCount : 0}
							</span>
						</div>
					</div>
				</div>
			</div>
		</CommentsDialog>
	)
}

export default PostGridItem
