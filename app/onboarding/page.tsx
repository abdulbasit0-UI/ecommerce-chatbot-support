import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { OnboardingForm } from "@/components/onboarding/onboarding-form"

export default async function OnboardingPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  if (session.user.isOnboarded) {
    redirect("/dashboard")
  }

  return <OnboardingForm />
}
