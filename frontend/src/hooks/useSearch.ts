import { useState, useEffect, useCallback, useRef } from "react"
import axios_instance from "@/config/axios"

// Simple debounce utility
const useDebounce = (callback: (...args: any[]) => void, delay: number) => {
	const timeoutRef = useRef<NodeJS.Timeout | null>(null)

	return useCallback(
		(...args: any[]) => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
			timeoutRef.current = setTimeout(() => callback(...args), delay)
		},
		[callback, delay]
	)
}

export interface SearchUser {
	_id: string
	username: string
	image?: string
	bio?: string
	emailVerified?: boolean
	followersCount: number
	isFollowing: boolean
}

export interface SearchPost {
	_id: string
	caption: string
	image: string
	author: {
		username: string
		image?: string
		emailVerified: boolean
	}
	likes: Array<{
		username: string
		image?: string
		emailVerified: boolean
	}>
	isBookmarked: boolean
	bookmarksCount: number
	commentsCount: number
	likesCount: number
	createdAt: string
	comments: any[]
}

export interface SearchResults {
	users: SearchUser[]
	posts: SearchPost[]
}

interface UseSearchReturn {
	searchResults: SearchResults
	isLoading: boolean
	isError: boolean
	error: string | null
	searchQuery: string
	setSearchQuery: (query: string) => void
}

export const useSearch = (): UseSearchReturn => {
	const [searchQuery, setSearchQuery] = useState("")
	const [searchResults, setSearchResults] = useState<SearchResults>({
		users: [],
		posts: [],
	})
	const [isLoading, setIsLoading] = useState(false)
	const [isError, setIsError] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Search function
	const performSearch = useCallback(async (query: string) => {
		if (!query.trim()) {
			setSearchResults({ users: [], posts: [] })
			setIsLoading(false)
			return
		}

		setIsLoading(true)
		setIsError(false)
		setError(null)

		try {
			// Search both users and posts in parallel
			const [usersResponse, postsResponse] = await Promise.all([
				axios_instance.get(
					`/users/search?q=${encodeURIComponent(query)}&limit=20`
				),
				axios_instance.get(
					`/posts/search?q=${encodeURIComponent(query)}&limit=20`
				),
			])

			if (usersResponse.data.success && postsResponse.data.success) {
				setSearchResults({
					users: usersResponse.data.data || [],
					posts: (postsResponse.data.data || []).map((post: any) => ({
						...post,
						comments: [], // Add empty comments array for PostGrid compatibility
						author: {
							...post.author,
							emailVerified: post.author.emailVerified || false,
						},
						likes: (post.likes || []).map((like: any) => ({
							...like,
							emailVerified: like.emailVerified || false,
						})),
					})),
				})
			} else {
				throw new Error("Failed to fetch search results")
			}
		} catch (err) {
			console.error("Search error:", err)
			setIsError(true)
			setError(err instanceof Error ? err.message : "Search failed")
			setSearchResults({ users: [], posts: [] })
		} finally {
			setIsLoading(false)
		}
	}, [])

	// Debounced search function
	const debouncedSearch = useDebounce(performSearch, 300)

	// Effect to trigger search when query changes
	useEffect(() => {
		if (searchQuery.trim()) {
			setIsLoading(true)
			debouncedSearch(searchQuery)
		} else {
			setSearchResults({ users: [], posts: [] })
			setIsLoading(false)
		}
	}, [searchQuery, debouncedSearch])

	return {
		searchResults,
		isLoading,
		isError,
		error,
		searchQuery,
		setSearchQuery,
	}
}
