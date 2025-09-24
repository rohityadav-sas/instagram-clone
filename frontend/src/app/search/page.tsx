"use client"
import Sidebar from "@/components/Sidebar"
import SearchComponent from "@/components/Search"

export default function SearchPage() {
	return (
		<div className="flex h-screen overflow-hidden">
			<Sidebar />
			<SearchComponent />
		</div>
	)
}
