

import NextAuth from "next-auth"
import { authOptions } from "./auth.config"
// @ts-ignore
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
