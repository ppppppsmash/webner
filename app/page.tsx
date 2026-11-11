import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">webner</h1>
      <p className="text-muted-foreground">Gallery site coming soon.</p>
      <Link href="/management" className="text-sm underline underline-offset-4">
        Management
      </Link>
    </main>
  );
}
