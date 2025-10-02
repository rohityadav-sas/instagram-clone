"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useForm } from "react-hook-form"
import Image from "next/image"
import toast from "react-hot-toast"
import { authClient } from "@/auth/auth-client"
import { useSessionExpiredStore } from "@/store/store"

interface LoginFormData {
	password: string
	email?: string
	username?: string
}

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const [loading, setLoading] = useState(false)
	const [selectedEmail, setSelectedEmail] = useState<boolean>(true)
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

	const forgotPassword = async () => {
		const fn = async () => {
			if (!watch("email")) {
				throw new Error("Please enter your email address")
			}
			const { error } = await authClient.requestPasswordReset({
				email: watch("email") || "",
				redirectTo: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/reset-password`,
			})
			if (error) {
				if (error.status === 400) {
					throw new Error("Email address is not valid")
				}
				throw new Error(error.message)
			}
		}
		toast.promise(fn(), {
			loading: "Sending password reset email...",
			success: "Password reset email sent.",
			error: (err) => err.message || "Something went wrong",
		})
	}

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<LoginFormData>()

	const onSubmit = async ({ email, password, username }: LoginFormData) => {
		setLoading(true)

		async function login() {
			let response
			if (email) {
				response = await authClient.signIn.email({
					email: email,
					password: password,
					callbackURL: "/",
				})
			} else if (username) {
				response = await authClient.signIn.username(
					{
						username: username,
						password: password,
					},
					{
						onSuccess: () => {
							window.location.href = "/"
						},
					}
				)
			}
			if (response?.error) {
				if (response.error.status === 403)
					throw new Error("Please verify your email address")
				throw new Error(response.error.message)
			}
			useSessionExpiredStore.getState().setSessionExpired(false)
			return "Logged in successfully!"
		}

		toast
			.promise(login(), {
				loading: "Logging in...",
				success: (message) => message,
				error: (err) => err.message || "Something went wrong",
			})
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
								<h1 className="text-2xl font-bold">Welcome</h1>
								<p className="text-muted-foreground text-balance">
									Login to your Instagram account
								</p>
							</div>

							<div className="grid gap-3">
								{selectedEmail ? (
									<>
										<div className="flex justify-between items-center">
											<Label htmlFor="email">Email</Label>
											<span
												className="text-sm hover:underline cursor-pointer"
												onClick={() => {
													setSelectedEmail(false)
												}}
											>
												Login with username
											</span>
										</div>
										<Input
											id="email"
											{...register("email", {
												required: "Email is required",
											})}
										/>
										{errors.email && (
											<p className="text-red-500 text-sm">
												{errors.email.message}
											</p>
										)}
									</>
								) : (
									<>
										<div className="flex justify-between items-center">
											<Label htmlFor="username">Username</Label>
											<span
												className="text-sm hover:underline cursor-pointer"
												onClick={() => {
													setSelectedEmail(true)
												}}
											>
												Login with email
											</span>
										</div>
										<Input
											id="username"
											{...register("username", {
												required: "Username is required",
											})}
										/>
										{errors.username && (
											<p className="text-red-500 text-sm">
												{errors.username.message}
											</p>
										)}
									</>
								)}
							</div>
							<div className="grid gap-3">
								<div className="flex items-center">
									<Label htmlFor="password">Password</Label>
									<a
										className="ml-auto text-sm underline-offset-2 hover:underline cursor-pointer"
										onClick={forgotPassword}
									>
										Forgot your password?
									</a>
								</div>
								<Input
									id="password"
									type="password"
									{...register("password", {
										required: "Password is required",
									})}
								/>
								{errors.password && (
									<p className="text-red-500 text-sm">
										{errors.password.message}
									</p>
								)}
							</div>
							<Button
								type="submit"
								className="w-full cursor-pointer"
								disabled={loading}
							>
								{loading ? "Signing in..." : "Login"}
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
								Don&apos;t have an account?{" "}
								<a href="/register" className="underline underline-offset-4">
									Sign up
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
		</div>
	)
}
