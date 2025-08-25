import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SignUpForm } from "@/components/auth/signup-form"

export default async function SignUpPage() {
  const session = await auth()

  if (session) {
    if (!session.user.isOnboarded) {
      redirect("/onboarding")
    }
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Get Started</h1>
          <p className="text-muted-foreground">Create your ChatBot Pro account</p>
        </div>
        <SignUpForm />
      </div>
    </div>
  )
}
