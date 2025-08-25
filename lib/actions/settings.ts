"use server"

import { auth, signOut } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { profileSchema, passwordSchema, deleteAccountSchema } from "@/lib/validations/settings"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

export async function updateProfile(formData: FormData) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const data = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    businessName: formData.get("businessName") as string,
    website: formData.get("website") as string,
  }

  const validatedData = profileSchema.parse(data)

  // Check if email is already taken by another user
  if (validatedData.email !== session.user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser && existingUser.id !== session.user.id) {
      throw new Error("Email is already taken")
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: validatedData,
  })

  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const data = {
    currentPassword: formData.get("currentPassword") as string,
    newPassword: formData.get("newPassword") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  }

  const validatedData = passwordSchema.parse(data)

  // Get current user with password
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  })

  if (!user?.password) {
    throw new Error("User not found or no password set")
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(validatedData.currentPassword, user.password)

  if (!isCurrentPasswordValid) {
    throw new Error("Current password is incorrect")
  }

  // Hash new password
  const hashedNewPassword = await bcrypt.hash(validatedData.newPassword, 12)

  // Update password
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedNewPassword },
  })

  return { success: true }
}

export async function deleteAccount(formData: FormData) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const data = {
    confirmText: formData.get("confirmText") as string,
    password: formData.get("password") as string,
  }

  const validatedData = deleteAccountSchema.parse(data)

  // Get current user with password
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  })

  if (!user?.password) {
    throw new Error("User not found or no password set")
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(validatedData.password, user.password)

  if (!isPasswordValid) {
    throw new Error("Password is incorrect")
  }

  // Delete user and all related data (cascading deletes will handle chatbots, conversations, etc.)
  await prisma.user.delete({
    where: { id: session.user.id },
  })

  // Sign out user
  await signOut({ redirect: false })
  redirect("/")
}
