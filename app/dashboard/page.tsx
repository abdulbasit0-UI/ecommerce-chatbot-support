import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Bot } from "lucide-react"
import Link from "next/link"

async function getDashboardData(userId: string) {
  const [user, chatbots, conversations] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, businessName: true },
    }),
    prisma.chatbot.findMany({
      where: { userId },
      include: {
        _count: {
          select: { conversations: true },
        },
      },
    }),
    prisma.chatConversation.findMany({
      where: {
        chatbot: { userId },
      },
      include: {
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ])

  const totalConversations = conversations.length
  const activeUsers = new Set(conversations.map((c) => c.sessionId)).size
  const responseRate = 85 // Mock data - would calculate from actual responses

  const recentActivities = conversations.slice(0, 5).map((conv, index) => ({
    id: conv.id,
    type: "conversation" as const,
    message: `New conversation started on chatbot`,
    timestamp: conv.createdAt.toLocaleDateString(),
    user: `User ${conv.sessionId.slice(-4)}`,
    status: index % 3 === 0 ? "active" : index % 3 === 1 ? "resolved" : "pending",
  }))

  return {
    user,
    stats: {
      totalChatbots: chatbots.length,
      totalConversations,
      activeUsers,
      responseRate,
    },
    chatbots,
    recentActivities,
  }
}

export default async function DashboardPage() {
  const session = await auth()
  const data = await getDashboardData(session!.user.id)

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <DashboardHeader
        title={`Welcome back, ${data.user?.name || "User"}!`}
        description={`Manage your ${data.user?.businessName || "business"} chatbots and customer interactions`}
      />

      <div className="grid gap-4">
        <StatsCards stats={data.stats} />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <RecentActivity activities={data.recentActivities as any} />
          </div>
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with your chatbots</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.stats.totalChatbots === 0 ? (
                  <div className="text-center py-6">
                    <Bot className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No chatbots yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first chatbot to start engaging with customers
                    </p>
                    <Button asChild>
                      <Link href="/dashboard/chatbots/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Chatbot
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button asChild className="w-full">
                      <Link href="/dashboard/chatbots/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Chatbot
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full bg-transparent">
                      <Link href="/dashboard/chatbots">View All Chatbots</Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full bg-transparent">
                      <Link href="/dashboard/conversations">View Conversations</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
