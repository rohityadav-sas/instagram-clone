"use client"

import Sidebar from "@/components/Sidebar"
import About from "@/components/ui/about"
import axios_instance from "@/config/axios"
import { useUserStore } from "@/store/store"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"

export default function Page() {
	const { username } = useParams()
	const currentUsername = useUserStore((state) => state.username)
	const { data, error, isLoading, isError } = useQuery({
		queryKey: ["profile", username],
		queryFn: async () => {
			const response = await axios_instance.get(`/users/${username}`)
			if (!response.data.success) throw new Error(response.data.message)
			return response.data.data
		},
		enabled: !!username,
		retry: false,
	})
	const isOwnProfile = currentUsername === username
	return (
		<div className="flex h-screen">
			<Sidebar />
			<About
				fullname={data?.name}
				username={data?.username}
				image={data?.image}
				gender={data?.gender}
				bio={data?.bio}
				followersCount={data?.followers.length}
				followingCount={data?.following.length}
				emailVerified={data?.emailVerified}
				isUserLoading={isLoading}
				isUserError={isError}
				error={error?.message}
				isOwnProfile={isOwnProfile}
				isFollowing={data?.followers.some(
					(follower: { username: string }) =>
						follower.username === currentUsername
				)}
				isBlocked={data?.isBlocked}
			/>
		</div>
	)
}
