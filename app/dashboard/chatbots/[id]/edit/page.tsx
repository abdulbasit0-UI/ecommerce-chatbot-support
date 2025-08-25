import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ChatbotForm } from "@/components/chatbot/chatbot-form"

async function getChatbot(chatbotId: string, userId: string) {
  return await prisma.chatbot.findFirst({
    where: {
      id: chatbotId,
      userId,
    },
  })
}

export default async function EditChatbotPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  const chatbot = await getChatbot(id, session!.user.id)

  if (!chatbot) {
    notFound()
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <DashboardHeader
        title={`Edit ${chatbot.name}`}
        description="Update your chatbot's configuration and appearance"
      />
      <ChatbotForm chatbot={chatbot} isEditing />
    </div>
  )
}
