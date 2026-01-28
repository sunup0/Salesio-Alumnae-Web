'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Calendar, BookOpen, Settings, LogOut, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const menuItems = [
    { name: '홈 / 대시보드', href: '/', icon: LayoutDashboard },
    { name: '동문 인명록', href: '/directory', icon: Users },
    { name: '행사 및 소모임', href: '/gatherings', icon: Calendar },
    { name: '추억 아카이브', href: '/library', icon: BookOpen },
]

const adminItem = { name: '관리자', href: '/admin', icon: Settings }

export function SidebarContent() {
    const pathname = usePathname()

    return (
        <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-border/50">
                <div className="flex items-center gap-2 font-bold text-xl text-primary tracking-tight">
                    <GraduationCap className="w-6 h-6" />
                    <span>살레시오 여고 동문회</span>
                </div>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start gap-3 h-12 text-base font-medium",
                                    isActive
                                        ? "bg-primary/10 text-primary hover:bg-primary/15"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Button>
                        </Link>
                    )
                })}

                <div className="my-4 h-[1px] bg-border/50 mx-2" />

                <Link href={adminItem.href}>
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full justify-start gap-3 h-12 text-base font-medium",
                            pathname === adminItem.href
                                ? "bg-primary/10 text-primary hover:bg-primary/15"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                    >
                        <adminItem.icon className="w-5 h-5" />
                        {adminItem.name}
                    </Button>
                </Link>
            </nav>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-border/50 bg-sidebar/30">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                        SA
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">김살레시오 (30회)</p>
                        <p className="text-xs text-muted-foreground truncate">salesio@example.com</p>
                    </div>
                    <LogOut className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
                </div>
            </div>
        </div>
    )
}

export function Sidebar() {
    return (
        <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border bg-sidebar/50 backdrop-blur-xl transition-all hidden md:flex flex-col z-50">
            <SidebarContent />
        </aside>
    )
}
