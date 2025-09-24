"use client"
import Sidebar from "@/components/Sidebar"
import ExploreComponent from "@/components/Explore"

export default function ExplorePage() {
	return (
		<div className="flex h-screen overflow-hidden">
			<Sidebar />
			<ExploreComponent />
		</div>
	)
}
