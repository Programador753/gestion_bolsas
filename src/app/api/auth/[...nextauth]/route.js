// src/app/api/auth/[...nextauth]/route.js
import { handlers } from "@/auth" // Referring to the auth.js we just created
export const { GET, POST } = handlers

