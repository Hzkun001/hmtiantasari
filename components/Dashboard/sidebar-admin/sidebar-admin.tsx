'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
    useSidebar,
} from '@/components/ui-shadcn/sidebar';
import { LayoutDashboard, FolderKanban, Calendar, Users, Settings, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type MenuItem = {
    label: string;
    href: string;
    icon: React.ReactNode;
};

const menuItems: MenuItem[] = [
    {
        label: 'Dashboard',
        href: '/admin',
        icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
        label: 'Projects',
        href: '/admin/projects',
        icon: <FolderKanban className="h-4 w-4" />,
    },
    {
        label: 'Activities',
        href: '/admin/activities',
        icon: <Calendar className="h-4 w-4" />,
    },
    {
        label: 'Team Members',
        href: '/admin/team-members',
        icon: <Users className="h-4 w-4" />,
    },
    {
        label: 'Settings',
        href: '/admin/settings',
        icon: <Settings className="h-4 w-4" />,
    },
];

function isActiveRoute(pathname: string, href: string) {
    const normalized = pathname === '/' ? pathname : pathname.replace(/\/$/, '');
    if (href === '/admin') {
        return normalized === '/admin';
    }
    return normalized.startsWith(href);
}

export function SidebarAdmin() {
    const pathname = usePathname();
    const router = useRouter();
    const { open } = useSidebar();
    const showLabels = open;

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    }

    return (
        <Sidebar
            variant="floating"
            collapsible="icon"
            className="border-none bg-transparent text-(--admin-text)"
        >
            <SidebarHeader
                className={cn(
                    'gap-3',
                    showLabels ? 'justify-between' : 'flex-col items-center',
                )}
            >
                <div className={cn('flex items-center gap-3', showLabels ? 'pl-2' : 'flex-col')}>
                    <div
                        className={cn(
                            "relative inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-(--admin-accent) text-(--admin-accent) transition-all duration-300",
                            "before:absolute before:inset-0 before:rounded-full before:bg-[rgba(255,213,108,0.12)] before:scale-0 before:transition-transform before:duration-300",
                            "hover:shadow-[0_0_20px_rgba(255,213,108,0.2)] hover:before:scale-100",
                        )}
                        aria-hidden="true"
                    >
                        <span className="relative z-10 text-sm font-bold">H</span>
                    </div>

                    <div className={cn('flex flex-col', !showLabels && 'sr-only')}>
                        <span className="text-sm font-semibold text-(--admin-accent) tracking-tight">
                            HMTI
                        </span>
                        <span className="text-xs text-(--admin-muted) uppercase tracking-wider">
                            Admin Panel
                        </span>
                    </div>
                </div>

                <SidebarTrigger className={cn(!showLabels && 'h-8 w-8')} />
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel
                        className={cn(
                            'text-(--admin-muted) text-xs uppercase tracking-wider',
                            !showLabels && 'sr-only',
                        )}
                    >
                        Overview
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {menuItems.map((item) => {
                            const active = isActiveRoute(pathname, item.href);

                            return (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={active}
                                        className={cn(
                                            'rounded-xl transition-colors hover:text-(--admin-accent) data-[active=true]:text-(--admin-accent)',
                                            !showLabels && 'justify-center gap-0 px-2',
                                        )}
                                    >
                                        <Link href={item.href} title={item.label}>
                                            <span className="shrink-0">{item.icon}</span>
                                            {showLabels ? (
                                                <span className="truncate">{item.label}</span>
                                            ) : (
                                                <span className="sr-only">{item.label}</span>
                                            )}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={handleLogout}
                            className={cn(
                                'rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300',
                                !showLabels && 'justify-center gap-0 px-2',
                            )}
                        >
                            <LogOut className="h-4 w-4" />
                            {showLabels ? (
                                <span>Logout</span>
                            ) : (
                                <span className="sr-only">Logout</span>
                            )}
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                {showLabels && (
                    <div className="px-2 py-2 text-xs text-(--admin-muted) border-t border-(--admin-border)">
                        <a href="/"><span>HMTI • HOMEPAGE</span></a>
                    </div>
                )}
            </SidebarFooter>
        </Sidebar>
    );
}
