import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { type User } from "@/types/user"

const useUserStore = create<User>()(
	persist(
		(set) => ({
			_id: "",
			username: "",
			email: "",
			profile_picture: "",
			bio: "",
			gender: "",
			isVerified: false,
			followersCount: 0,
			followingCount: 0,
			bookmarksCount: 0,
			posts: [],
			setUser: (user) => set((state) => ({ ...state, ...user })),
			setUserAsync: async (user) => {
				set((state) => ({ ...state, ...user }))
			},
			clearUser: () =>
				set({
					username: "",
					email: "",
					profile_picture: "",
					bio: "",
					gender: "",
					isVerified: false,
					followersCount: 0,
					followingCount: 0,
					bookmarksCount: 0,
					posts: [],
				}),
		}),
		{
			name: "user-storage",
			storage: createJSONStorage(() => localStorage),
		}
	)
)

const useOnlineUsersStore = create<{
	onlineUsers: string[]
	setOnlineUsers: (users: string[]) => void
	following: string[]
	setFollowing: (users: string[]) => void
	followers: string[]
	setFollowers: (users: string[]) => void
}>((set) => ({
	onlineUsers: [],
	following: [],
	followers: [],
	setOnlineUsers: (users) => set({ onlineUsers: users }),
	setFollowing: (users) => set({ following: users }),
	setFollowers: (users) => set({ followers: users }),
}))

export { useUserStore, useOnlineUsersStore }
