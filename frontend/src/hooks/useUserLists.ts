import { useQuery } from "@tanstack/react-query"
import axios from "@/config/axios"
import { User } from "@/types/user"

interface UserListResponse {
	message: string
	data: User[]
	success: boolean
}

interface PostLikesResponse {
	message: string
	data: User[]
	success: boolean
}

export const useUserFollowers = (
	username: string | undefined,
	enabled = true
) => {
	return useQuery({
		queryKey: ["user-followers", username],
		queryFn: async (): Promise<User[]> => {
			if (!username) throw new Error("Username is required")

			const response = await axios.get<UserListResponse>(
				`/users/${username}/followers`
			)
			return response.data.data
		},
		enabled: enabled && !!username,
	})
}

export const useUserFollowing = (
	username: string | undefined,
	enabled = true
) => {
	return useQuery({
		queryKey: ["user-following", username],
		queryFn: async (): Promise<User[]> => {
			if (!username) throw new Error("Username is required")

			const response = await axios.get<UserListResponse>(
				`/users/${username}/following`
			)
			return response.data.data
		},
		enabled: enabled && !!username,
	})
}

export const usePostLikes = (postId: string | undefined, enabled = true) => {
	return useQuery({
		queryKey: ["post-likes", postId],
		queryFn: async (): Promise<User[]> => {
			if (!postId) throw new Error("Post ID is required")

			const response = await axios.get<PostLikesResponse>(
				`/posts/${postId}/likes`
			)
			return response.data.data
		},
		enabled: enabled && !!postId,
	})
}
