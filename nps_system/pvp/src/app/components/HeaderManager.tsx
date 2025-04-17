'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';
import SurveyHeader from './headers/SurveyHeader';

export default function HeaderManager() {
  const pathname = usePathname();

  if (pathname === '/') {
    return (
        <Navigation
            onScrollTo={(id: string) => {
              const element = document.getElementById(id);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
        />
    );
  }

  if (
      pathname.startsWith('/survey') ||
      pathname.startsWith('/statistics') ||
      pathname.startsWith('/profile')
  ) {
    return <SurveyHeader />;
  }

  return null; // Don't show any header on other pages (like /login, /register, etc.)
}
