declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      isOnboarded?: boolean
    }
  }

  interface User {
    isOnboarded?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isOnboarded?: boolean
  }
}
