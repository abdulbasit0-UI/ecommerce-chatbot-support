import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Bot, MessageSquare, Settings, Eye } from "lucide-react"
import Link from "next/link"
import { ChatbotActions } from "@/components/chatbot/chatbot-actions"

async function getChatbots(userId: string) {
  return await prisma.chatbot.findMany({
    where: { userId },
    include: {
      _count: {
        select: { conversations: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export default async function ChatbotsPage() {
  const session = await auth()
  const chatbots = await getChatbots(session!.user.id)

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <DashboardHeader title="Chatbots" description="Manage your AI chatbots and their configurations" />
        <Button asChild>
          <Link href="/dashboard/chatbots/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Chatbot
          </Link>
        </Button>
      </div>

      {chatbots.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No chatbots yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Create your first chatbot to start engaging with customers and providing automated support.
            </p>
            <Button asChild>
              <Link href="/dashboard/chatbots/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Chatbot
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {chatbots.map((chatbot) => (
            <Card key={chatbot.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: chatbot.primaryColor }}
                    >
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{chatbot.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={chatbot.isActive ? "default" : "secondary"}>
                          {chatbot.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <ChatbotActions chatbot={chatbot} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p className="line-clamp-2">{chatbot.welcomeMessage}</p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    <span>{chatbot._count.conversations} conversations</span>
                  </div>
                  <span className="text-muted-foreground">{new Date(chatbot.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                    <Link href={`/dashboard/chatbots/${chatbot.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                    <Link href={`/dashboard/chatbots/${chatbot.id}/edit`}>
                      <Settings className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
