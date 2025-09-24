import { useEffect } from "react"
import axios_instance from "@/config/axios"
import { useQuery } from "@tanstack/react-query"
import About from "./ui/about"
import { useUserStore } from "@/store/store"

const ProfileComponent = () => {
	const {
		username,
		profile_picture,
		gender,
		bio,
		followersCount,
		followingCount,
		isVerified,
		setUser,
	} = useUserStore()

	const { data, isLoading, isError } = useQuery({
		queryKey: ["profile-posts", username],
		queryFn: async () => {
			const response = await axios_instance.get(`/posts/${username}`)
			return response.data.data.posts
		},
		enabled: !!username,
		staleTime: 1000 * 60 * 5,
	})

	useEffect(() => {
		if (data) setUser({ posts: data })
	}, [data, setUser])

	return (
		<About
			username={username}
			profile_picture={profile_picture}
			gender={gender}
			bio={bio}
			followersCount={followersCount}
			followingCount={followingCount}
			isVerified={isVerified}
			isOwnProfile={true}
		/>
	)
}

export default ProfileComponent
