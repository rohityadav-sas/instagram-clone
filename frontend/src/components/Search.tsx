import { Search, Loader2 } from "lucide-react"
import { useSearch } from "@/hooks/useSearch"
import SearchUserItem from "@/components/ui/search-user-item"
import PostGrid from "@/components/ui/post-grid"

const SearchComponent = () => {
	const {
		searchResults,
		isLoading,
		isError,
		error,
		searchQuery,
		setSearchQuery,
	} = useSearch()

	return (
		<div className="flex-1 flex flex-col max-w-lg mx-auto p-4">
			<div className="relative mb-6">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
				<input
					type="text"
					placeholder="Search users, posts..."
					value={searchQuery}
					autoFocus
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				{isLoading && (
					<Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
				)}
			</div>

			{isError && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
					<p className="text-red-600 text-sm">
						{error || "Something went wrong while searching"}
					</p>
				</div>
			)}

			{searchQuery && (
				<div className="space-y-6">
					{searchResults.users.length > 0 && (
						<div>
							<h3 className="text-sm font-semibold text-gray-600 mb-3">
								People
							</h3>
							<div className="space-y-1">
								{searchResults.users.map((user) => (
									<SearchUserItem key={user._id} user={user} />
								))}
							</div>
						</div>
					)}

					{searchResults.posts.length > 0 && (
						<div>
							<h3 className="text-sm font-semibold text-gray-600 mb-3">
								Posts
							</h3>
							<PostGrid posts={searchResults.posts} />
						</div>
					)}

					{!isLoading &&
						searchResults.users.length === 0 &&
						searchResults.posts.length === 0 && (
							<div className="text-center py-12">
								<p className="text-gray-500">
									No results found for "{searchQuery}"
								</p>
							</div>
						)}
				</div>
			)}

			{!searchQuery && (
				<div className="text-center py-12">
					<Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
					<h2 className="text-xl font-semibold text-gray-800 mb-2">Search</h2>
					<p className="text-gray-600">Search for people, posts, and more...</p>
				</div>
			)}
		</div>
	)
}

export default SearchComponent
