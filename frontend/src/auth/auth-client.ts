import { createAuthClient } from "better-auth/react"
import { usernameClient } from "better-auth/client/plugins"
import { inferAdditionalFields } from "better-auth/client/plugins"
import { type auth } from "../../../backend/src/auth/auth"

export const authClient = createAuthClient({
	baseURL: "http://localhost:5000",
	plugins: [usernameClient(), inferAdditionalFields<typeof auth>()],
})
