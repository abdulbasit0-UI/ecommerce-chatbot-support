import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, MessageSquare, Users, TrendingUp } from "lucide-react"

interface StatsCardsProps {
  stats: {
    totalChatbots: number
    totalConversations: number
    activeUsers: number
    responseRate: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Chatbots",
      value: stats.totalChatbots,
      description: "Active chatbots",
      icon: Bot,
      trend: "+2 from last month",
    },
    {
      title: "Conversations",
      value: stats.totalConversations,
      description: "This month",
      icon: MessageSquare,
      trend: "+12% from last month",
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      description: "Unique visitors",
      icon: Users,
      trend: "+8% from last month",
    },
    {
      title: "Response Rate",
      value: `${stats.responseRate}%`,
      description: "Average response rate",
      icon: TrendingUp,
      trend: "+5% from last month",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
            <p className="text-xs text-green-600 mt-1">{card.trend}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
