"use client"

import axios_instance from "@/config/axios"
import { useUserStore } from "@/store/store"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
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

	const setUser = useUserStore((state) => state.setUser)
	const searchParams = useSearchParams()

	useEffect(() => {
		const token = localStorage.getItem("bearer_token")
		const needsAuth = protectedRoutes.some((route) => {
			if (pathname === "/") {
				const authToken = searchParams.get("authToken")
				if (authToken) {
					localStorage.setItem("bearer_token", authToken)
					window.history.replaceState({}, "", "/")
					axios_instance.get("/users/me").then((response) => {
						setUser(response.data.data)
					})
				} else return true
			}
			if (route === "/") return false
			else return pathname?.startsWith(route)
		})
		if (needsAuth && !token) {
			router.replace("/login")
		} else {
			setLoading(false)
		}
		axios_instance.get("/users/me").then((response) => {
			setUser(response.data.data)
		})
	}, [pathname, router])

	if (loading) return null

	return <>{children}</>
}
