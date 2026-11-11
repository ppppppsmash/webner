import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ManagementNotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-6xl font-semibold tracking-tight">404</p>
      <p className="text-muted-foreground">找不到此頁面</p>
      <Button nativeButton={false} render={<Link href="/management" />}>
        回到總覽
      </Button>
    </main>
  );
}
