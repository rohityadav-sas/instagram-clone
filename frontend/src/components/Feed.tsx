"use client"

import { useState, useEffect, useCallback } from "react"
import Stories from "@/components/ui/stories"
import Posts from "@/components/ui/posts"
import { PostSkeleton } from "@/components/ui/skeleton"
import { type Post } from "@/types/post"
import axios_instance from "@/config/axios"

// Hook for feed data management with real API integration
const usePostsData = () => {
	const [posts, setPosts] = useState<Post[]>([])
	const [isLoadingPosts, setIsLoadingPosts] = useState(true)
	const [hasMore, setHasMore] = useState(true)
	const [page, setPage] = useState(1)

	// Fetch feed posts from API
	const fetchPosts = useCallback(async (page = 1, reset = true) => {
		setIsLoadingPosts(true)
		try {
			const response = await axios_instance.get(
				`/posts/feed?page=${page}&limit=10`
			)

			if (response.data.success) {
				const newPosts = response.data.data
				if (reset) setPosts(newPosts)
				else setPosts((prev) => [...prev, ...newPosts])

				setHasMore(response.data.pagination.hasMore)
				setPage(page)
			} else {
				throw new Error(response.data.message || "Failed to fetch posts")
			}
		} catch (error) {
			console.error("Error fetching posts:", error)
			if (reset) setPosts([])
		} finally {
			setIsLoadingPosts(false)
		}
	}, [])

	const loadMorePosts = useCallback(async () => {
		if (!hasMore || isLoadingPosts) return
		await fetchPosts(page + 1, false)
	}, [hasMore, isLoadingPosts, fetchPosts, page])

	useEffect(() => {
		fetchPosts()
	}, [fetchPosts])

	return {
		posts,
		isLoadingPosts,
		hasMore,
		loadMore: loadMorePosts,
	}
}

const Feed = () => {
	const { posts, isLoadingPosts, hasMore, loadMore } = usePostsData()

	return (
		<div className="flex-1 h-screen overflow-y-auto bg-gray-50">
			<main className="feed-container mx-auto px-4 sm:px-6 lg:px-8 py-6">
				<div className="max-w-lg mx-auto lg:max-w-2xl xl:max-w-4xl">
					{/* Stories - now with real API integration */}
					<Stories />

					{/* Posts */}
					{isLoadingPosts ? (
						<PostSkeleton />
					) : (
						<Posts
							posts={posts}
							isLoading={isLoadingPosts}
							hasMore={hasMore}
							onLoadMore={loadMore}
						/>
					)}
				</div>
			</main>
		</div>
	)
}

export default Feed
