"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { onboardingSchema } from "@/lib/validations/onboarding"
import { redirect } from "next/navigation"

export async function completeOnboarding(formData: FormData) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const data = {
    businessName: formData.get("businessName") as string,
    website: formData.get("website") as string,
    productCount: formData.get("productCount") as string,
    referralSource: formData.get("referralSource") as string,
  }

  const validatedData = onboardingSchema.parse(data)

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...validatedData,
      isOnboarded: true,
    },
  })

  redirect("/dashboard")
}
