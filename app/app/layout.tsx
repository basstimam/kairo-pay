import { Sidebar } from "@/components/app/sidebar";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-lime-50">
        <Sidebar />
        <main className="pl-64 min-h-screen">
          <div className="container mx-auto p-8 lg:p-12 max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
