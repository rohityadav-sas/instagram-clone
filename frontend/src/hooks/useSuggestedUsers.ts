import { useQuery } from "@tanstack/react-query"
import axios_instance from "@/config/axios"

export interface SuggestedUser {
	_id?: string
	username: string
	image?: string
	bio?: string
	emailVerified?: boolean
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
