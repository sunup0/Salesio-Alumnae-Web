'use client'

import { Search, Menu, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from '@/components/ui/sheet'
import { SidebarContent } from './sidebar'

export function Header() {
    return (
        <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/60 backdrop-blur-xl md:left-64 md:w-[calc(100%-16rem)] ml-auto">
            <div className="flex h-16 items-center px-4 md:px-6 gap-4">
                {/* Mobile Menu Trigger */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-72">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>

                {/* Search Bar Placeholder (Removed per user request) */}
                <div className="flex-1" />

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border border-background"></span>
                    </Button>
                </div>
            </div>
        </header>
    )
}
