import { createAuthClient } from "better-auth/react"
import { usernameClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
	plugins: [usernameClient()],
	fetchOptions: {
		auth: {
			type: "Bearer",
			token: () => localStorage.getItem("bearer_token") || "",
		},
		onSuccess: (ctx) => {
			const authToken = ctx.response.headers.get("set-auth-token")
			if (authToken) localStorage.setItem("bearer_token", authToken)
		},
	},
})
