import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
	// Check for authentication token in cookies
	const token = req.cookies.get("better-auth.session_token")

	// If no token, redirect to login
	if (!token) {
		const url = req.nextUrl.clone()
		url.pathname = "/login"
		return NextResponse.redirect(url)
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
