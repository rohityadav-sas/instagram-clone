import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "react-hot-toast"
import "./globals.css"
import TanstackProvider from "@/app/TanstackProvider"
import LoadingBar from "@/components/ui/loading-bar"
import SocketInitializer from "./socketProvider"
import RouteGuard from "@/components/RouteGuard"

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
})

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
})

export const metadata: Metadata = {
	title: "Instagram",
	description: "A simple Instagram clone built with Next.js and Tailwind CSS",
	icons: {
		icon: "/favicon.png",
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<SocketInitializer>
					<LoadingBar />
					<TanstackProvider>
						<RouteGuard>{children}</RouteGuard>
					</TanstackProvider>
					<Toaster
						toastOptions={{
							success: {
								iconTheme: {
									primary: "#3f3f46",
									secondary: "#fafafa",
								},
							},
							error: {
								iconTheme: {
									primary: "#3f3f46",
									secondary: "#fafafa",
								},
							},
						}}
					/>
				</SocketInitializer>
			</body>
		</html>
	)
}
