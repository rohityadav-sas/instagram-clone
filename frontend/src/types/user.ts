import { type Post } from "./post"

export type User = {
	_id: string
	name: string
	username: string
	email: string
	full_name?: string
	image: string | null | undefined
	bio: string
	gender: string
	emailVerified?: boolean
	isFollowing?: boolean
	followersCount: number
	followingCount: number
	bookmarksCount: number
	posts: Post[]
	setUser: (user: Partial<User>) => void
	setUserAsync: (user: Partial<User>) => Promise<void>
	clearUser: () => void
}
