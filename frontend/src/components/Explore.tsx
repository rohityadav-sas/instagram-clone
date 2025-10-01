import PostGrid from "./ui/post-grid"
import { useQuery } from "@tanstack/react-query"
import axios_instance from "@/config/axios"
import SuggestedUserCard from "./ui/suggested-user-card"
import {
	useSuggestedUsers,
	type SuggestedUser,
} from "@/hooks/useSuggestedUsers"

const ExploreComponent = () => {
	const { data: posts, isLoading } = useQuery({
		queryKey: ["explorePosts"],
		queryFn: async () => {
			const { data } = await axios_instance.get("/posts/explore")
			if (!data.success)
				throw new Error(data.message || "Failed to fetch posts")
			return data.data
		},
	})

	const {
		data: suggestedUsers,
		isLoading: isSuggestedUsersLoading,
		isError: isSuggestedUsersError,
	} = useSuggestedUsers()

	return (
		<div className="flex-1 overflow-y-auto">
			<div className="max-w-4xl mx-auto p-4">
				<h2 className="text-xl font-semibold text-gray-800 mb-6">Explore</h2>

				{/* Posts Grid */}
				<PostGrid posts={posts} isLoading={isLoading} />

				{/* Suggested People Section */}
				<div className="mt-8">
					<h3 className="text-lg font-semibold text-gray-800 mb-4">
						Suggested for you
					</h3>
					{isSuggestedUsersLoading ? (
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							{Array.from({ length: 8 }).map((_, i) => (
								<div
									key={i}
									className="text-center p-4 border border-gray-200 rounded-lg flex flex-col items-center animate-pulse"
								>
									<div className="w-20 h-20 bg-gray-200 rounded-full mb-3" />
									<div className="h-4 bg-gray-200 rounded w-16 mb-2" />
									<div className="h-3 bg-gray-200 rounded w-20 mb-3" />
									<div className="h-6 bg-gray-200 rounded w-12" />
								</div>
							))}
						</div>
					) : isSuggestedUsersError ? (
						<div className="text-center py-8 text-gray-500">
							<p>Unable to load suggested users</p>
						</div>
					) : suggestedUsers && suggestedUsers.length > 0 ? (
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							{suggestedUsers.map((user: SuggestedUser) => (
								<SuggestedUserCard
									key={user.username}
									username={user.username}
									image={user.image}
									bio={user.bio}
								/>
							))}
						</div>
					) : (
						<div className="text-center py-8 text-gray-500">
							<p>No suggested users available</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default ExploreComponent
