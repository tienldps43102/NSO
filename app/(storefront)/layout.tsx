import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader user={session?.user || null} />
      <main>{children}</main>

      <SiteFooter />
    </div>
  );
}
