import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("beacon_session")?.value;
  const decoded = token ? verifyToken(token) : null;

  if (decoded) {
    if (decoded.role === "admin") {
      redirect("/admin/console");
    } else {
      redirect("/dashboard");
    }
  } else {
    redirect("/login");
  }
}
