import Sidebar from "@/components/Sidebar"
import Feed from "@/components/Feed"
import Suggestions from "@/components/Suggestions"

export default async function Home() {
	return (
		<div className="flex h-screen overflow-hidden">
			<Sidebar />
			<Feed />
			<Suggestions />
		</div>
	)
}
