
import { signIn, signOut, auth } from "@/auth"

 
export default async function SignIn() {
  // This is a server component, so we can use the auth function directly
    const session = await auth()
    console.log("Session:", session)
    const user = session?.user

    return user ? (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <p>Welcome, {user.name}</p>
        <p>Email: {user.email}</p>
        <img src={user.image} alt="User Image" className="w-32 h-32 rounded-full" />

        <form 
          action={async () => {
            "use server"
            await signOut()
          }}
        >
          <button className="bg-red-500 text-white px-4 py-2 rounded"
          type="submit">Sign out</button>
        </form>
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <p>You are not signed in</p>
        <form
          action={async () => {
            "use server"
            await signIn("google")
          }}
        >
          <button className="bg-blue-500 text-white px-4 py-2 rounded"
          type="submit">Sign in with Google</button>
        </form>
      </div>
    )
  }