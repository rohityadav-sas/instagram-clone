import { type Post } from "@/types/post"
import PostGridItem from "./post-grid-item"

const PostGridSkeleton = () => {
	return (
		<div className="grid grid-cols-3 gap-1 md:gap-4">
			{Array.from({ length: 6 }).map((_, index) => (
				<div key={index} className="aspect-square relative">
					<div className="w-full h-full bg-gray-200 animate-pulse rounded-md" />
				</div>
			))}
		</div>
	)
}

const PostGrid = ({
	posts,
	isLoading,
}: {
	posts: Post[]
	isLoading?: boolean
}) => {
	if (isLoading) {
		return <PostGridSkeleton />
	}
	return (
		<div className="grid grid-cols-3 gap-1 md:gap-4">
			{posts.map((post) => {
				return <PostGridItem key={post._id} post={post} />
			})}
		</div>
	)
}

export { PostGridSkeleton }
export default PostGrid
