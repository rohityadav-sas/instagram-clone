import axios from "axios"

const axios_instance = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL + "/api",
	withCredentials: true,
	validateStatus: () => true,
})

export default axios_instance
