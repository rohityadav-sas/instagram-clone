import { type BetterAuthPlugin } from "better-auth"

export const socialBearer = () => {
	return {
		id: "social-bearer",
		onResponse: async (response) => {
			const authToken = response.headers.get("set-auth-token")

			if (authToken) {
				const location = response.headers.get("location")
				if (location) {
					response.headers.set("location", `${location}?authToken=${authToken}`)
				}
			}
		},
	} satisfies BetterAuthPlugin
}
