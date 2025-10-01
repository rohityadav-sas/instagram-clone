import { LoginForm } from "@/components/LoginForm"
import AccountDeletionSuccess from "@/components/ui/AccountDeleted"
import EmailVerifiedSuccess from "@/components/ui/VerifyEmail"
interface SearchParamsProps {
	searchParams: {
		acc?: string
	}
}

export default async function LoginPage({ searchParams }: SearchParamsProps) {
	const params = await searchParams
	if (params.acc === "deleted") return <AccountDeletionSuccess />
	if (params.acc === "verified") return <EmailVerifiedSuccess />
	return (
		<div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm md:max-w-3xl">
				<LoginForm />
			</div>
		</div>
	)
}
