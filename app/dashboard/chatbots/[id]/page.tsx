import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bot, MessageSquare, Settings, BarChart3 } from "lucide-react"
import Link from "next/link"
import { ChatbotActions } from "@/components/chatbot/chatbot-actions"
import { EmbedInstructions } from "@/components/chatbot/embed-instructions"

async function getChatbot(chatbotId: string, userId: string) {
  return await prisma.chatbot.findFirst({
    where: {
      id: chatbotId,
      userId,
    },
    include: {
      _count: {
        select: { conversations: true },
      },
      conversations: {
        include: {
          _count: {
            select: { messages: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  })
}

export default async function ChatbotDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = await params;
  console.log(id)
  const session = await auth()
  const chatbot = await getChatbot(id, session!.user.id)

  if (!chatbot) {
    notFound()
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <DashboardHeader title={chatbot.name} description="Chatbot details and configuration" />
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/chatbots/${chatbot.id}/edit`}>
              <Settings className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <ChatbotActions chatbot={chatbot} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={chatbot.isActive ? "default" : "secondary"} className="mb-2">
              {chatbot.isActive ? "Active" : "Inactive"}
            </Badge>
            <p className="text-xs text-muted-foreground">
              {chatbot.isActive ? "Responding to visitors" : "Not responding"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chatbot._count.conversations}</div>
            <p className="text-xs text-muted-foreground">Total conversations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chatbot.conversations.reduce((acc, conv) => acc + conv._count.messages, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total messages</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <EmbedInstructions embedCode={chatbot.embedCode} chatbotName={chatbot.name} />

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Current chatbot settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Primary Color</label>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-6 h-6 rounded border" style={{ backgroundColor: chatbot.primaryColor }} />
                <span className="text-sm text-muted-foreground">{chatbot.primaryColor}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Welcome Message</label>
              <p className="text-sm text-muted-foreground mt-1">{chatbot.welcomeMessage}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Created</label>
              <p className="text-sm text-muted-foreground mt-1">{new Date(chatbot.createdAt).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {chatbot.conversations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Conversations</CardTitle>
            <CardDescription>Latest customer interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chatbot.conversations.map((conversation) => (
                <div key={conversation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Session {conversation.sessionId.slice(-8)}</p>
                    <p className="text-xs text-muted-foreground">
                      {conversation._count.messages} messages • {new Date(conversation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
