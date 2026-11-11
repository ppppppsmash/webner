import { Navbar } from "@/components/management/navbar";

export default function DashboardLayout({ children }: LayoutProps<"/management">) {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl space-y-6 p-4 pt-6 md:p-8">{children}</div>
      </main>
    </>
  );
}
