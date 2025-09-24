"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode, useState } from "react"

export default function ReactQueryProvider({
	children,
}: {
	children: ReactNode
}) {
	// useState ensures the client isn’t recreated on every render
	const [queryClient] = useState(() => new QueryClient())

	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	)
}
