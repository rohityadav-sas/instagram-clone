import PostComponent from "@/components/ui/post"
import { PostSkeleton } from "@/components/ui/skeleton"
import { type Post } from "@/types/post"

const Posts = ({
	posts,
	isLoading = false,
	hasMore = false,
	onLoadMore,
}: {
	posts: Post[]
	isLoading?: boolean
	hasMore?: boolean
	onLoadMore?: () => void
}) => {
	// Use provided posts or default sample posts
	const postsData = posts

	return (
		<div className="w-full max-w-lg mx-auto">
			<div className="space-y-6 lg:space-y-8">
				{postsData.map((post) => (
					<PostComponent key={post._id} postData={post} />
				))}

				{/* Loading skeletons */}
				{isLoading && (
					<>
						<PostSkeleton />
						<PostSkeleton />
					</>
				)}
			</div>

			{/* Load More Button */}
			{hasMore && !isLoading && (
				<div className="text-center py-6">
					<button
						onClick={onLoadMore}
						className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
					>
						Load More Posts
					</button>
				</div>
			)}

			{/* End of feed message */}
			{!hasMore && !isLoading && postsData.length > 0 && (
				<div className="text-center py-8 lg:py-12">
					<p className="text-gray-500 text-sm lg:text-base">
						You're all caught up!
					</p>
					<p className="text-gray-400 text-xs lg:text-sm mt-1">
						You've seen all new posts from people you follow.
					</p>
				</div>
			)}

			{/* No posts message */}
			{!isLoading && postsData.length === 0 && (
				<div className="text-center py-12">
					<p className="text-gray-500 text-lg">No posts to show</p>
					<p className="text-gray-400 text-sm mt-1">
						Follow some accounts to see their posts here.
					</p>
				</div>
			)}
		</div>
	)
}

export default Posts
