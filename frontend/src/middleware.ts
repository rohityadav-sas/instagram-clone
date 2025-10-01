import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { authClient } from "./auth/auth-client"

export async function middleware(req: NextRequest) {
	// grab headers directly from the request
	const headersObj = Object.fromEntries(req.headers.entries())

	const { data, error } = await authClient.getSession({
		fetchOptions: {
			headers: headersObj,
		},
	})

	if (error) {
		console.error("Error fetching session:", error)
		throw new Error("Failed to fetch session")
	}

	if (!data?.session) {
		const url = req.nextUrl.clone()
		url.pathname = "/login"
		return NextResponse.rewrite(url)
	}

	return NextResponse.next()
}

export const config = {
	matcher: [
		"/",
		"/profile/:path*",
		"/explore",
		"/notifications",
		"/messages/:path*",
	],
}
