import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { authClient } from "./auth/auth-client"

export async function middleware(req: NextRequest) {
	const { data, error } = await authClient.getSession()
	if (error) {
		console.error("Error fetching session:", error)
		const url = req.nextUrl.clone()
		url.pathname = "/login"
		return NextResponse.rewrite(url)
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
