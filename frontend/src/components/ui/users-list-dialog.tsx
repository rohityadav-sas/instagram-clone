"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { CheckCircle, Loader2 } from "lucide-react"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
	useUserFollowers,
	useUserFollowing,
	usePostLikes,
} from "@/hooks/useUserLists"
import { useFollowUser } from "@/hooks/useFollowUser"
import { useUserStore } from "@/store/store"
import { User } from "@/types/user"
import { useQueryClient } from "@tanstack/react-query"

interface UsersListDialogProps {
	children: React.ReactNode
	username?: string
	type: "followers" | "following" | "likes"
	title: string
	postId?: string // Required for likes
}

const UsersListDialog = ({
	children,
	username,
	type,
	title,
	postId,
}: UsersListDialogProps) => {
	const [open, setOpen] = useState(false)
	const currentUsername = useUserStore((state) => state.username)

	// Use appropriate hook based on type
	const followersQuery = useUserFollowers(
		username,
		type === "followers" && open
	)
	const followingQuery = useUserFollowing(
		username,
		type === "following" && open
	)
	const likesQuery = usePostLikes(postId, type === "likes" && open)
	const queryClient = useQueryClient()

	let users: User[] = []
	let isLoading = false
	let error = null

	useEffect(() => {
		if (!open) return
		switch (type) {
			case "followers":
				queryClient.invalidateQueries({
					queryKey: ["user-followers", username],
				})
				break
			case "following":
				queryClient.invalidateQueries({
					queryKey: ["user-following", username],
				})
				break
			case "likes":
				queryClient.invalidateQueries({ queryKey: ["post-likes", postId] })
				break
		}
	}, [open, type, username, postId, queryClient])

	switch (type) {
		case "followers":
			users = followersQuery.data || []
			isLoading = followersQuery.isLoading
			error = followersQuery.error
			break
		case "following":
			users = followingQuery.data || []
			isLoading = followingQuery.isLoading
			error = followingQuery.error
			break
		case "likes":
			users = likesQuery.data || []
			isLoading = likesQuery.isLoading
			error = likesQuery.error
			break
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-[400px] max-h-[600px]">
				<DialogHeader className="border-b pb-4">
					<DialogTitle className="text-center">{title}</DialogTitle>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto max-h-[400px]">
					{isLoading ? (
						<div className="space-y-4 p-4">
							{Array.from({ length: 6 }).map((_, i) => (
								<div key={i} className="flex items-center gap-3">
									<div className="w-11 h-11 bg-gray-200 animate-pulse rounded-full" />
									<div className="flex-1">
										<div className="h-4 bg-gray-200 animate-pulse rounded w-20 mb-1" />
										<div className="h-3 bg-gray-200 animate-pulse rounded w-16" />
									</div>
									<div className="h-8 bg-gray-200 animate-pulse rounded w-20" />
								</div>
							))}
						</div>
					) : error ? (
						<div className="text-center py-8 text-red-500">
							<p>Error loading {type}</p>
						</div>
					) : users && users.length > 0 ? (
						<div className="">
							{users.map((user: User) => (
								<UserItem
									key={user._id}
									user={user}
									currentUsername={currentUsername}
								/>
							))}
						</div>
					) : (
						<div className="text-center py-8 text-gray-500">
							<p>No {type} found</p>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}

interface UserItemProps {
	user: User
	currentUsername: string | null
}

const UserItem = ({ user, currentUsername }: UserItemProps) => {
	const isOwnProfile = user.username === currentUsername

	const {
		isFollowing: isFollowingState,
		isLoading: isFollowLoading,
		toggleFollow,
	} = useFollowUser(user.username, user.isFollowing || false, 0)

	return (
		<div className="flex items-center gap-3 p-2 hover:bg-gray-50 transition-colors cursor-pointer">
			<div className="flex-shrink-0">
				<Image
					src={user.image || "/default-avatar.svg"}
					alt={user.username}
					width={44}
					height={44}
					style={{
						borderRadius: "50%",
						objectFit: "cover",
						aspectRatio: "1 / 1",
					}}
				/>
			</div>

			<div
				className="flex-1 min-w-0"
				onClick={() => {
					window.location.href = `/${user.username}`
				}}
			>
				<div className="flex items-center gap-1">
					<span className="font-semibold text-sm truncate">
						{user.username}
					</span>
					{user.emailVerified && (
						<CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
					)}
				</div>
				{user.full_name && (
					<p className="text-gray-500 text-xs truncate">{user.full_name}</p>
				)}
			</div>

			{!isOwnProfile && (
				<Button
					size="sm"
					variant={isFollowingState ? "outline" : "default"}
					onClick={toggleFollow}
					disabled={isFollowLoading}
					className="text-xs px-4 py-1 h-8 min-w-[70px] cursor-pointer"
				>
					{isFollowLoading ? (
						<Loader2 className="w-3 h-3 animate-spin" />
					) : isFollowingState ? (
						"Following"
					) : (
						"Follow"
					)}
				</Button>
			)}
		</div>
	)
}

export default UsersListDialog
