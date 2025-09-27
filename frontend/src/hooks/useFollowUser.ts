import { useState, useCallback, useEffect } from "react"
import axios_instance from "@/config/axios"
import toast from "react-hot-toast"

interface UseFollowUserReturn {
	isFollowing: boolean
	followersCount: number | undefined
	isLoading: boolean
	toggleFollow: () => void
}

export const useFollowUser = (
	username: string,
	initialIsFollowing: boolean,
	initialFollowersCount?: number,
	onFollowersCountChange?: (newCount: number) => void
): UseFollowUserReturn => {
	const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
	const [followersCount, setFollowersCount] = useState<number | undefined>(
		initialFollowersCount
	)
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		setIsFollowing(initialIsFollowing)
	}, [initialIsFollowing])

	useEffect(() => {
		setFollowersCount(initialFollowersCount)
	}, [initialFollowersCount])

	const toggleFollow = useCallback(async () => {
		if (isLoading) return

		setIsLoading(true)

		setIsFollowing((wasFollowing) => {
			setFollowersCount((prev) => {
				if (prev === undefined) return prev
				return wasFollowing ? prev - 1 : prev + 1
			})
			return !wasFollowing
		})

		try {
			const response = await axios_instance.post(
				`/users/toggle-follow/${username}`
			)

			if (!response.data.success) {
				throw new Error(
					response.data.message || "Error following/unfollowing user"
				)
			}

			if (response.data.data?.followersCount !== undefined) {
				setFollowersCount(response.data.data.followersCount)
				onFollowersCountChange?.(response.data.data.followersCount)
			}
		} catch (error) {
			console.error("Error toggling follow:", error)

			setIsFollowing((wasFollowing) => {
				setFollowersCount((prev) => {
					if (prev === undefined) return prev
					return wasFollowing ? prev - 1 : prev + 1
				})
				return !wasFollowing
			})

			toast.error(
				error instanceof Error
					? error.message
					: "Error following/unfollowing user"
			)
		} finally {
			setIsLoading(false)
		}
	}, [username, isFollowing, followersCount, isLoading, onFollowersCountChange])

	return {
		isFollowing,
		followersCount,
		isLoading,
		toggleFollow,
	}
}
