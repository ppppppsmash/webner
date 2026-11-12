import { auth } from "@/auth";
import { NavUser } from "./nav-user";

/** Server side: reads the session (runtime data) and hands plain props to the client menu. */
export async function SidebarUser() {
  const session = await auth();
  const user = session?.user;
  if (!user) return null;
  return <NavUser name={user.name ?? null} email={user.email ?? null} image={user.image ?? null} role={user.role} />;
}
