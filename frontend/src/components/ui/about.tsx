import { CheckCircle, Grid3X3, Settings } from "lucide-react"
import Image from "next/image"
import React from "react"
import PostGrid from "./post-grid"
import axios_instance from "@/config/axios"
import { useQuery } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { useFollowUser } from "@/hooks/useFollowUser"
import EditProfileDialog from "./edit-profile-dialog"
import BlockUserDialog from "./block-user-dialog"
import UsersListDialog from "./users-list-dialog"
import DeleteUserDialog from "./delete-user-dialog"
import { authClient } from "@/auth/auth-client"

interface AboutProps {
	fullname: string
	username: string
	image: string
	gender: string
	bio: string
	followersCount: number
	followingCount: number
	emailVerified?: boolean
	isUserLoading?: boolean
	isUserError?: boolean
	error?: string
	isOwnProfile?: boolean
	isFollowing?: boolean
	isBlocked?: boolean
}

const About = ({
	fullname,
	username,
	image,
	gender,
	bio,
	followersCount,
	followingCount,
	emailVerified = false,
	isUserLoading,
	isUserError,
	isOwnProfile = false,
	isFollowing = false,
	isBlocked = false,
}: AboutProps) => {
	const [activeTab, setActiveTab] = React.useState<"posts" | "saved">("posts")
	const {
		data: posts,
		isLoading: isPostsLoading,
		isError: isPostsError,
	} = useQuery({
		queryKey: ["profile-posts", username],
		queryFn: async () => {
			const response = await axios_instance.get(`/posts/${username}`)
			return response.data.data.posts
		},
		enabled: !!username,
	})

	const session = authClient.useSession()

	const handleVerify = async () => {
		const fn = async () => {
			if (!session.data?.user.email)
				throw new Error("No email associated with this account")

			const { error } = await authClient.sendVerificationEmail({
				email: session.data?.user.email!,
				callbackURL: process.env.NEXT_PUBLIC_FRONTEND_URL,
			})
			if (error) throw new Error(error.message)
		}
		toast.promise(fn(), {
			loading: "Sending verification email...",
			success: "Verification email sent!",
			error: (err) => err.message || "Error sending verification email",
		})
	}
	const {
		data: bookmarks,
		isLoading: isBookmarksLoading,
		isError: isBookmarksError,
	} = useQuery({
		queryKey: ["profile-bookmarks"],
		queryFn: async () => {
			const { data } = await axios_instance.get(`/posts/bookmarks`)
			return data.data || []
		},
		enabled: !!username,
	})

	const {
		isFollowing: isFollowingState,
		followersCount: followersCountState,
		isLoading: isFollowLoading,
		toggleFollow,
	} = useFollowUser(username, isFollowing, followersCount)

	if (isUserLoading) {
		return (
			<div className="flex-1 overflow-y-auto">
				<div className="max-w-4xl mx-auto p-8">
					{/* Profile Header Skeleton */}
					<div className="flex items-start gap-8 mb-8">
						{/* Profile Picture Skeleton */}
						<div className="flex-shrink-0">
							<div className="w-[150px] h-[150px] bg-gray-200 animate-pulse rounded-full" />
						</div>

						{/* Profile Info Skeleton */}
						<div className="flex-1">
							<div className="flex items-center gap-4 mb-4">
								<div className="h-8 bg-gray-200 animate-pulse rounded w-32" />
								<div className="h-8 bg-gray-200 animate-pulse rounded w-24" />
								<div className="w-5 h-5 bg-gray-200 animate-pulse rounded" />
							</div>

							{/* Stats Skeleton */}
							<div className="flex gap-8 mb-4">
								<div className="h-4 bg-gray-200 animate-pulse rounded w-16" />
								<div className="h-4 bg-gray-200 animate-pulse rounded w-20" />
								<div className="h-4 bg-gray-200 animate-pulse rounded w-18" />
							</div>

							{/* Bio Skeleton */}
							<div className="space-y-2">
								<div className="h-4 bg-gray-200 animate-pulse rounded w-48" />
								<div className="h-4 bg-gray-200 animate-pulse rounded w-24" />
							</div>
						</div>
					</div>

					{/* Tab Navigation Skeleton */}
					<div className="border-t border-gray-200">
						<div className="flex justify-center gap-8 py-4">
							<div className="h-6 bg-gray-200 animate-pulse rounded w-16" />
							<div className="h-6 bg-gray-200 animate-pulse rounded w-16" />
						</div>
					</div>

					{/* Content Area Skeleton */}
					<div className="mt-6">
						<div className="grid grid-cols-3 gap-1">
							{Array.from({ length: 9 }).map((_, i) => (
								<div
									key={i}
									className="aspect-square bg-gray-200 animate-pulse rounded-sm"
								/>
							))}
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (isUserError) {
		return (
			<div className="flex-1 overflow-y-auto">
				<div className="max-w-4xl mx-auto p-8">
					<div className="text-center py-20">
						<div className="w-20 h-20 border-2 border-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
							<svg
								className="w-10 h-10 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
								/>
							</svg>
						</div>
						<h3 className="text-2xl font-light text-gray-800 mb-3">
							User Not Found
						</h3>
						<p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
							Sorry, this page isn't available. The link you followed may be
							broken, or the page may have been removed.
						</p>
					</div>
				</div>
			</div>
		)
	}
	return (
		<div className="flex-1 overflow-y-auto">
			<div className="max-w-4xl mx-auto p-8">
				{/* Profile Header */}
				<div className="flex items-start gap-8 mb-8">
					{/* Profile Picture */}
					<div className="flex-shrink-0">
						<Image
							src={image || "/default-avatar.svg"}
							alt={username || "User Avatar"}
							width={150}
							height={150}
							style={{
								objectFit: "cover",
								borderRadius: "50%",
								aspectRatio: "1 / 1",
							}}
						/>
					</div>

					{/* Profile Info */}
					<div className="flex-1">
						<div className="flex items-center gap-4 mb-4">
							<h1 className="text-2xl font-light flex items-center gap-1">
								{username}
								{emailVerified ? (
									<CheckCircle className="size-4 text-blue-500" />
								) : (
									isOwnProfile && (
										<button
											title="Verify your email to get the verified badge"
											onClick={handleVerify}
											className="ml-2 cursor-pointer text-xs px-4 py-1 border border-blue-500 text-blue-500 rounded hover:bg-blue-50 transition-colors font-semibold"
										>
											Verify
										</button>
									)
								)}
							</h1>

							<button
								className={`px-4 py-1 text-sm cursor-pointer font-semibold border border-gray-300 rounded hover:bg-blue-100 transition-colors ${
									isOwnProfile ? "cursor-default hover:bg-white" : ""
								} ${isFollowLoading ? "opacity-50 cursor-wait" : ""}`}
								onClick={isOwnProfile ? undefined : toggleFollow}
								disabled={isFollowLoading}
							>
								{isOwnProfile ? (
									<EditProfileDialog
										currentProfile={{
											name: fullname,
											username,
											bio,
											gender,
											image,
										}}
									>
										<span>Edit profile</span>
									</EditProfileDialog>
								) : (
									<span>{isFollowingState ? "Unfollow" : "Follow"}</span>
								)}
							</button>
							{!isOwnProfile && (
								<BlockUserDialog username={username} isBlocked={isBlocked}>
									<Settings className="w-5 h-5 text-gray-600 cursor-pointer" />
								</BlockUserDialog>
							)}
							{isOwnProfile && (
								<DeleteUserDialog>
									<Settings className="w-5 h-5 text-gray-600 cursor-pointer" />
								</DeleteUserDialog>
							)}
						</div>

						{/* Stats */}
						<div className="flex gap-8 mb-4">
							<span>
								<strong>{posts ? posts.length : 0}</strong> posts
							</span>
							<UsersListDialog
								username={username}
								type="followers"
								title="Followers"
							>
								<span
									className="cursor-pointer hover:text-gray-700 transition-colors"
									title={`${followersCountState} followers`}
								>
									<strong>{followersCountState ?? followersCount}</strong>{" "}
									followers
								</span>
							</UsersListDialog>
							<UsersListDialog
								username={username}
								type="following"
								title="Following"
							>
								<span
									className="cursor-pointer hover:text-gray-700 transition-colors"
									title={`${followingCount} following`}
								>
									<strong>{followingCount}</strong> following
								</span>
							</UsersListDialog>
						</div>

						{/* Bio */}
						<div className="text-sm">
							{bio && <p className="font-semibold mb-1">{bio}</p>}
							<p className="text-gray-600">
								{gender === "male" ? "He/Him" : "She/Her"}
							</p>
						</div>
					</div>
				</div>

				{/* Tab Navigation */}
				<div className="border-t border-gray-200">
					<div className="flex justify-center">
						<button
							onClick={() => setActiveTab("posts")}
							className={`flex cursor-pointer items-center gap-2 px-6 py-3 text-xs font-semibold tracking-wide uppercase ${
								activeTab === "posts"
									? "text-gray-900 border-t-2 border-gray-900"
									: "text-gray-500"
							}`}
						>
							<Grid3X3 className="w-3 h-3" />
							Posts
						</button>
						{isOwnProfile && (
							<button
								onClick={() => setActiveTab("saved")}
								className={`flex cursor-pointer items-center gap-2 px-6 py-3 text-xs font-semibold tracking-wide uppercase ${
									activeTab === "saved"
										? "text-gray-900 border-t-2 border-gray-900"
										: "text-gray-500"
								}`}
							>
								<svg
									className="w-3 h-3"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
								</svg>
								Saved
							</button>
						)}
					</div>
				</div>

				{/* Content */}
				<div className="mt-6">
					{activeTab === "posts" && (
						<div>
							{isPostsError ? (
								<div className="text-center py-12 text-red-500">
									Error loading posts
								</div>
							) : posts?.length > 0 || isPostsLoading ? (
								<PostGrid posts={posts} isLoading={isPostsLoading} />
							) : (
								<div className="text-center py-12">
									<div className="w-16 h-16 border-2 border-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
										<Grid3X3 className="w-8 h-8 text-gray-300" />
									</div>
									<h3 className="text-xl font-light mb-2">No Posts Yet</h3>
									<p className="text-gray-500">
										When you share photos, they'll appear here.
									</p>
								</div>
							)}
						</div>
					)}

					{activeTab === "saved" && (
						<div>
							{isBookmarksError ? (
								<div className="text-center py-12 text-red-500">
									Error loading bookmarks
								</div>
							) : bookmarks?.length > 0 || isBookmarksLoading ? (
								<PostGrid posts={bookmarks} isLoading={isBookmarksLoading} />
							) : (
								<div className="text-center py-12">
									<div className="w-16 h-16 border-2 border-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
										<svg
											className="w-8 h-8 text-gray-300"
											fill="currentColor"
											viewBox="0 0 24 24"
										>
											<path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
										</svg>
									</div>
									<h3 className="text-xl font-light mb-2">No Saved Posts</h3>
									<p className="text-gray-500">
										Save posts you want to see again.
									</p>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default About
