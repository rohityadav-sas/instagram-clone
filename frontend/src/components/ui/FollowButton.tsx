import { useFollowUser } from "@/hooks/useFollowUser"
import React from "react"
import { Button } from "./button"

const FollowButton = ({
	username,
	initialIsFollowing,
}: {
	username: string
	initialIsFollowing: boolean
}) => {
	const { isLoading, isFollowing, toggleFollow } = useFollowUser(
		username,
		initialIsFollowing
	)
	return (
		<Button
			disabled={isLoading}
			onClick={toggleFollow}
			className="cursor-pointer w-24"
			variant={isFollowing ? "outline" : "default"}
		>
			{isLoading ? "..." : isFollowing ? "Following" : "Follow"}
		</Button>
	)
}

export default FollowButton
