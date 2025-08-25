import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ChatbotForm } from "@/components/chatbot/chatbot-form"

export default function NewChatbotPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <DashboardHeader title="Create New Chatbot" description="Set up a new AI chatbot for your website" />
      <ChatbotForm />
    </div>
  )
}
