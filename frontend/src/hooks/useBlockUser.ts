import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios_instance from "@/config/axios"
import toast from "react-hot-toast"

interface BlockUserResponse {
	success: boolean
	message: string
}

export const useBlockUser = (onSuccess?: () => void) => {
	const queryClient = useQueryClient()

	const blockUserMutation = useMutation<BlockUserResponse, Error, string>({
		mutationFn: async (username: string) => {
			const response = await axios_instance.post(`/users/block/${username}`)
			return response.data
		},
		onSuccess: (data) => {
			toast.success(data.message || "User blocked successfully")
			// Invalidate relevant queries
			queryClient.invalidateQueries({ queryKey: ["user"] })
			queryClient.invalidateQueries({ queryKey: ["blocked-users"] })
			onSuccess?.()
		},
		onError: (error: any) => {
			const message = error.response?.data?.message || "Failed to block user"
			toast.error(message)
		},
	})

	const unblockUserMutation = useMutation<BlockUserResponse, Error, string>({
		mutationFn: async (username: string) => {
			const response = await axios_instance.post(`/users/unblock/${username}`)
			return response.data
		},
		onSuccess: (data) => {
			toast.success(data.message || "User unblocked successfully")
			// Invalidate relevant queries
			queryClient.invalidateQueries({ queryKey: ["user"] })
			queryClient.invalidateQueries({ queryKey: ["blocked-users"] })
			onSuccess?.()
		},
		onError: (error: any) => {
			const message = error.response?.data?.message || "Failed to unblock user"
			toast.error(message)
		},
	})

	return {
		blockUser: blockUserMutation.mutate,
		unblockUser: unblockUserMutation.mutate,
		isLoading: blockUserMutation.isPending || unblockUserMutation.isPending,
	}
}
