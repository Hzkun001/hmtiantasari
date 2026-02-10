'use client';

import { usePathname } from 'next/navigation';
import SmoothScrollProvider from './SmoothScrollProvider';

export default function ConditionalSmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? '';

  const disableSmoothScroll =
    pathname.startsWith('/admin') || pathname.startsWith('/login');

  if (disableSmoothScroll) return <>{children}</>;

  return <SmoothScrollProvider>{children}</SmoothScrollProvider>;
}

