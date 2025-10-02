"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

// Define which routes need protection
const protectedRoutes = [
	"/",
	"/explore",
	"/messages",
	"/profile",
	"/notifications",
	"/search",
]

export default function RouteGuard({
	children,
}: {
	children: React.ReactNode
}) {
	const pathname = usePathname()
	const router = useRouter()
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const token = localStorage.getItem("bearer_token")

		// If current path starts with any protected route
		const needsAuth = protectedRoutes.some((route) => {
			if (route === "/") return false
			else return pathname?.startsWith(route)
		})
		if (needsAuth && !token) {
			router.replace("/login")
		} else {
			setLoading(false)
		}
	}, [pathname, router])

	if (loading) return null

	return <>{children}</>
}
