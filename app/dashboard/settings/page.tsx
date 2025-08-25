import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { AccountOverview } from "@/components/settings/account-overview"
import { ProfileForm } from "@/components/settings/profile-form"
import { PasswordForm } from "@/components/settings/password-form"
import { DangerZone } from "@/components/settings/danger-zone"

async function getUserData(userId: string) {
  const [user, chatbots, conversations] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        businessName: true,
        website: true,
        createdAt: true,
      },
    }),
    prisma.chatbot.count({
      where: { userId },
    }),
    prisma.chatConversation.count({
      where: {
        chatbot: { userId },
      },
    }),
  ])

  return {
    user: user!,
    stats: {
      totalChatbots: chatbots,
      totalConversations: conversations,
    },
  }
}

export default async function SettingsPage() {
  const session = await auth()
  const data = await getUserData(session!.user.id)

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <DashboardHeader title="Settings" description="Manage your account settings and preferences" />

      <div className="grid gap-6">
        <AccountOverview user={data.user} stats={data.stats} />
        <ProfileForm user={data.user} />
        <PasswordForm />
        <DangerZone />
      </div>
    </div>
  )
}
