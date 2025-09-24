import { useQuery } from "@tanstack/react-query"
import axios_instance from "@/config/axios"

export interface SuggestedUser {
	_id?: string
	username: string
	profile_picture?: string
	bio?: string
	isVerified?: boolean
	followedBy?: string[]
	isFollowing?: boolean
}

interface UseSuggestedUsersReturn {
	data: SuggestedUser[] | undefined
	isLoading: boolean
	isError: boolean
	error: Error | null
	refetch: () => void
}

export const useSuggestedUsers = (options?: {
	staleTime?: number
	enabled?: boolean
}): UseSuggestedUsersReturn => {
	const { data, isLoading, isError, error, refetch } = useQuery({
		queryKey: ["suggestedUsers"],
		queryFn: async () => {
			const { data } = await axios_instance.get("/users/suggested")
			if (!data.success) {
				throw new Error(data.message || "Failed to fetch suggested users")
			}
			return data.data as SuggestedUser[]
		},
		staleTime: options?.staleTime || 1000 * 60 * 5, // 5 minutes default
		enabled: options?.enabled !== false,
	})

	return {
		data,
		isLoading,
		isError,
		error: error as Error | null,
		refetch,
	}
}
