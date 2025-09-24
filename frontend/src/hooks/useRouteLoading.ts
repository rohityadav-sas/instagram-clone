"use client"
import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export const useRouteLoading = () => {
	const [loading, setLoading] = useState(false)
	const pathname = usePathname()
	const searchParams = useSearchParams()

	useEffect(() => {
		setLoading(false)
	}, [pathname, searchParams])

	const startLoading = () => setLoading(true)
	const stopLoading = () => setLoading(false)

	return { loading, startLoading, stopLoading }
}
