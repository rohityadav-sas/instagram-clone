import { SidebarItemProps } from "@/types/sidebar"

const SidebarItem = ({ icon, label, onClick, isActive }: SidebarItemProps) => {
	return (
		<button
			className={`flex gap-4 p-3 w-full cursor-pointer rounded-lg items-center transition-all duration-200 ${
				isActive
					? "bg-gray-300 font-bold"
					: "hover:bg-gray-200 active:bg-gray-300"
			}`}
			onClick={onClick}
			type="button"
		>
			<span
				className={`w-6 h-6 flex items-center justify-center ${
					isActive ? "text-black" : "text-gray-700"
				}`}
			>
				{icon}
			</span>
			<span
				className={`text-base ${isActive ? "text-black" : "text-gray-900"}`}
			>
				{label}
			</span>
		</button>
	)
}

export default SidebarItem
