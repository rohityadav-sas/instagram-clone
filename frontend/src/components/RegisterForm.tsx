"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import Image from "next/image"
import toast from "react-hot-toast"
import axios_instance from "@/config/axios"
import { useSessionExpiredStore, useUserStore } from "@/store/store"
import { authClient } from "@/auth/auth-client"

interface SignupFormData {
	name: string
	email: string
	username: string
	password: string
	confirmPassword: string
	terms: boolean
}

export function SignupForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const [loading, setLoading] = useState(false)
	const router = useRouter()
	const setUser = useUserStore((state) => state.setUser)

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<SignupFormData>()

	const password = watch("password")

	const LoginWithGitHub = async () => {
		await authClient.signIn.social({
			provider: "github",
			callbackURL: process.env.NEXT_PUBLIC_FRONTEND_URL,
		})
	}
	const LoginWithGoogle = async () => {
		await authClient.signIn.social({
			provider: "google",
			callbackURL: process.env.NEXT_PUBLIC_FRONTEND_URL,
		})
	}

	const onSubmit = async ({
		email,
		name,
		username,
		password,
	}: SignupFormData) => {
		setLoading(true)

		async function register() {
			const { error } = await authClient.signUp.email({
				email,
				password,
				username,
				name,
				callbackURL: "/login",
			})
			if (error) throw new Error(error.message)
			const user_response = await axios_instance.get("/users/me")
			setUser(user_response.data.data)
			useSessionExpiredStore.getState().setSessionExpired(false)
			return "Registration successful!"
		}

		toast
			.promise(
				register().then(async (message) => {
					router.push("/")
					const user_response = await axios_instance.get("/users/me")
					setUser(user_response.data.data)
					return message
				}),
				{
					loading: "Creating account...",
					success: (message) => message,
					error: (err) => err.message || "Something went wrong",
				}
			)
			.finally(() => {
				setLoading(false)
			})
	}
	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card className="overflow-hidden p-0">
				<CardContent className="grid p-0 md:grid-cols-2">
					<form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
						<div className="flex flex-col gap-6">
							<div className="flex flex-col items-center text-center">
								<h1 className="text-2xl font-bold">Create your account</h1>
								<p className="text-muted-foreground text-balance">
									Join Instagram and share your moments
								</p>
							</div>

							<div className="grid gap-3">
								<Label htmlFor="name">Name</Label>
								<Input
									id="name"
									type="text"
									{...register("name", {
										required: "Name is required",
									})}
								/>
								{errors.name && (
									<p className="text-red-500 text-sm">{errors.name.message}</p>
								)}
							</div>

							<div className="grid gap-3">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									{...register("email", {
										required: "Email is required",
										pattern: {
											value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
											message: "Invalid email address",
										},
									})}
								/>
								{errors.email && (
									<p className="text-red-500 text-sm">{errors.email.message}</p>
								)}
							</div>
							<div className="grid gap-3">
								<Label htmlFor="username">Username</Label>
								<Input
									id="username"
									type="text"
									{...register("username", {
										required: "Username is required",
										minLength: {
											value: 3,
											message: "Username must be at least 3 characters",
										},
									})}
								/>
								{errors.username && (
									<p className="text-red-500 text-sm">
										{errors.username.message}
									</p>
								)}
							</div>
							<div className="grid gap-3">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									type="password"
									{...register("password", {
										required: "Password is required",
										minLength: {
											value: 6,
											message: "Password must be at least 6 characters",
										},
									})}
								/>
								{errors.password && (
									<p className="text-red-500 text-sm">
										{errors.password.message}
									</p>
								)}
							</div>
							<div className="grid gap-3">
								<Label htmlFor="confirmPassword">Confirm Password</Label>
								<Input
									id="confirmPassword"
									type="password"
									{...register("confirmPassword", {
										required: "Please confirm your password",
										validate: (value) =>
											value === password || "Passwords do not match",
									})}
								/>
								{errors.confirmPassword && (
									<p className="text-red-500 text-sm">
										{errors.confirmPassword.message}
									</p>
								)}
							</div>
							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									id="terms"
									className="h-4 w-4 rounded border-gray-300"
									{...register("terms", {
										required: "Please accept the terms and conditions",
									})}
								/>
								<Label htmlFor="terms" className="text-sm">
									I agree to the{" "}
									<a
										href="#"
										className="underline underline-offset-4 hover:text-primary"
									>
										Terms of Service
									</a>{" "}
									and{" "}
									<a
										href="#"
										className="underline underline-offset-4 hover:text-primary"
									>
										Privacy Policy
									</a>
								</Label>
							</div>
							{errors.terms && (
								<p className="text-red-500 text-sm">{errors.terms.message}</p>
							)}
							<Button
								type="submit"
								className="w-full cursor-pointer"
								disabled={loading}
							>
								{loading ? "Creating Account..." : "Create Account"}
							</Button>
							<div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
								<span className="bg-card text-muted-foreground relative z-10 px-2">
									Or continue with
								</span>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<Button
									variant="outline"
									type="button"
									className="w-full cursor-pointer"
									onClick={LoginWithGitHub}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										className="h-4 w-4"
									>
										<path
											fill="currentColor"
											d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.26.82-.577 0-.285-.01-1.04-.016-2.04-3.338.727-4.042-1.61-4.042-1.61-.546-1.385-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.238 1.84 1.238 1.07 1.835 2.807 1.305 3.492.998.108-.775.418-1.305.762-1.606-2.665-.304-5.466-1.335-5.466-5.932 0-1.31.468-2.382 1.236-3.222-.124-.303-.536-1.524.118-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 3-.404c1.02.005 2.045.138 3 .404 2.29-1.552 3.297-1.23 3.297-1.23.655 1.652.243 2.873.12 3.176.77.84 1.235 1.912 1.235 3.222 0 4.61-2.804 5.625-5.475 5.922.43.372.823 1.103.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .32.217.694.825.576C20.565 21.796 24 17.3 24 12 24 5.373 18.627 0 12 0z"
										/>
									</svg>
								</Button>
								<Button
									variant="outline"
									type="button"
									className="w-full cursor-pointer"
									onClick={LoginWithGoogle}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										className="h-4 w-4"
									>
										<path
											fill="currentColor"
											d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
										/>
										<path
											fill="currentColor"
											d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
										/>
										<path
											fill="currentColor"
											d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
										/>
										<path
											fill="currentColor"
											d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
										/>
									</svg>
								</Button>
							</div>
							<div className="text-center text-sm">
								Already have an account?{" "}
								<a href="/login" className="underline underline-offset-4">
									Sign in
								</a>
							</div>
						</div>
					</form>
					<div className="bg-muted relative hidden md:block">
						<Image
							src="/login_banner.png"
							alt="Login banner"
							fill
							sizes="(max-width: 768px) 0vw, 50vw"
							className="object-cover dark:brightness-[0.2] dark:grayscale"
							priority
						/>
					</div>
				</CardContent>
			</Card>
			<div className="text-muted-foreground text-center text-xs text-balance">
				By creating an account, you agree to our{" "}
				<a href="#" className="underline underline-offset-4 hover:text-primary">
					Terms of Service
				</a>{" "}
				and{" "}
				<a href="#" className="underline underline-offset-4 hover:text-primary">
					Privacy Policy
				</a>
				.
			</div>
		</div>
	)
}
