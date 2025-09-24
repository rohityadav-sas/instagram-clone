"use client"
import { useState } from "react"
import axios_instance from "@/config/axios"
import toast from "react-hot-toast"
import { useUserStore } from "@/store/store"

export const usePostLikes = (
	postId: string,
	initialBookmark: boolean,
	intialBookmarksCount: number,
	initialLikes: any[] = []
) => {
	const user = useUserStore((state) => state)

	// Simple state management
	const [likes, setLikes] = useState(initialLikes)
	const [isTogglingLike, setIsTogglingLike] = useState(false)
	const [isBookmarked, setIsBookmarked] = useState(initialBookmark)
	const [bookmarksCount, setBookmarksCount] = useState(intialBookmarksCount)
	const [isTogglingBookmark, setIsTogglingBookmark] = useState(false)

	// Calculate current state
	const isLiked = likes.some((like: any) =>
		typeof like === "string" ? like === user._id : like._id === user._id
	)
	const toggleLike = async () => {
		if (isTogglingLike) return

		setIsTogglingLike(true)

		const newLikes = isLiked
			? likes.filter((like: any) =>
					typeof like === "string" ? like !== user._id : like._id !== user._id
			  )
			: [...likes, user._id]

		setLikes(newLikes)

		try {
			const response = await axios_instance.post(`/posts/toggle-like/${postId}`)
			if (!response.data.success)
				throw new Error(response.data.message || "Failed to toggle like")
		} catch (error) {
			setLikes(likes)
			console.error("Error toggling like:", error)
			if (error instanceof Error)
				toast.error(error.message || "Failed to update like")
		} finally {
			setIsTogglingLike(false)
		}
	}

	const toggleBookmark = async () => {
		if (isTogglingBookmark) return

		setIsTogglingBookmark(true)
		const previousState = isBookmarked
		const previousCount = bookmarksCount
		setIsBookmarked(!isBookmarked)
		setBookmarksCount(isBookmarked ? bookmarksCount - 1 : bookmarksCount + 1)

		try {
			const response = await axios_instance.post(
				`/posts/toggle-bookmark/${postId}`
			)
			if (!response.data.success)
				throw new Error(response.data.message || "Failed to toggle bookmark")
		} catch (error) {
			setIsBookmarked(previousState)
			setBookmarksCount(previousCount)
			console.error("Error toggling bookmark:", error)
			if (error instanceof Error)
				toast.error(error.message || "Failed to update bookmark")
		} finally {
			setIsTogglingBookmark(false)
		}
	}

	return {
		liked: isLiked,
		bookmarked: isBookmarked,
		bookmarksCount,
		likesCount: likes.length,
		likes,
		toggleLike,
		toggleBookmark,
		isTogglingLike,
	}
}
