"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { chatbotSchema } from "@/lib/validations/chatbot"
import { redirect } from "next/navigation"
import { nanoid } from "nanoid"

export async function createChatbot(formData: FormData) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const data = {
    name: formData.get("name") as string,
    primaryColor: formData.get("primaryColor") as string,
    welcomeMessage: formData.get("welcomeMessage") as string,
  }

  const validatedData = chatbotSchema.parse(data)

  const embedCode = nanoid(12)

  const chatbot = await prisma.chatbot.create({
    data: {
      ...validatedData,
      userId: session.user.id,
      embedCode,
    },
  })

  redirect(`/dashboard/chatbots/${chatbot.id}`)
}

export async function updateChatbot(chatbotId: string, formData: FormData) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const data = {
    name: formData.get("name") as string,
    primaryColor: formData.get("primaryColor") as string,
    welcomeMessage: formData.get("welcomeMessage") as string,
  }

  const validatedData = chatbotSchema.parse(data)

  const chatbot = await prisma.chatbot.findFirst({
    where: {
      id: chatbotId,
      userId: session.user.id,
    },
  })

  if (!chatbot) {
    throw new Error("Chatbot not found")
  }

  await prisma.chatbot.update({
    where: { id: chatbotId },
    data: validatedData,
  })

  redirect(`/dashboard/chatbots/${chatbotId}`)
}

export async function deleteChatbot(chatbotId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const chatbot = await prisma.chatbot.findFirst({
    where: {
      id: chatbotId,
      userId: session.user.id,
    },
  })

  if (!chatbot) {
    throw new Error("Chatbot not found")
  }

  await prisma.chatbot.delete({
    where: { id: chatbotId },
  })

  redirect("/dashboard/chatbots")
}

export async function toggleChatbotStatus(chatbotId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const chatbot = await prisma.chatbot.findFirst({
    where: {
      id: chatbotId,
      userId: session.user.id,
    },
  })

  if (!chatbot) {
    throw new Error("Chatbot not found")
  }

  await prisma.chatbot.update({
    where: { id: chatbotId },
    data: { isActive: !chatbot.isActive },
  })
}
