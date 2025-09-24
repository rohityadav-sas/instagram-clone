import React from "react"

export interface NavigationItem {
	icon: React.ReactNode
	label: string
	onClick?: () => void
}

export interface SidebarItemProps {
	icon: React.ReactNode
	label: string
	onClick?: () => void
	isActive?: boolean
}
