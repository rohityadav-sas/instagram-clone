import { useSessionExpiredStore } from "@/store/store"
import axios from "axios"
import toast from "react-hot-toast"

const axios_instance = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL + "/api",
	withCredentials: true,
	validateStatus: () => true,
})

axios_instance.interceptors.request.use(
	(config) => {
		if (typeof window !== "undefined") {
			const token = localStorage.getItem("bearer_token")
			if (token) {
				config.headers.Authorization = `Bearer ${token}`
			}
		}
		return config
	},
	(error) => {
		return Promise.reject(error)
	}
)

axios_instance.interceptors.response.use((response) => {
	if (
		response.data &&
		!response.data.success &&
		response.data.message === "Session expired" &&
		!useSessionExpiredStore.getState().sessionExpired
	) {
		useSessionExpiredStore.getState().setSessionExpired(true)
		if (typeof window !== "undefined") {
			toast.error("Session expired. Please log in again.")
			localStorage.removeItem("bearer_token")
			localStorage.removeItem("user-storage")
			setTimeout(() => {
				window.location.href = "/login"
			}, 1000)
		}
		throw new axios.Cancel("lolololol")
	} else return response
})

export default axios_instance
