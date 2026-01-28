import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Sidebar />
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 md:ml-64 p-4 md:p-8 pt-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
