import type { Metadata } from 'next';
import { SidebarAdmin } from '@/components/Dashboard/sidebar-admin/sidebar-admin';
import { SidebarInset, SidebarProvider } from '@/components/ui-shadcn/sidebar';
import './admin.css';

export const metadata: Metadata = {
    title: 'Admin Dashboard | HMTI',
    description: 'Admin dashboard for HMTI management.',
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider defaultOpen>
            <div className="admin-page min-h-screen w-full flex-1 min-w-0 p-0 m-0 flex pb-0">
                <SidebarAdmin />
                <SidebarInset className="min-w-0 pb-0 bg-transparent text-(--admin-text)">
                    {children}
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
