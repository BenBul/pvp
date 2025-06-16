'use client';

import { usePathname } from 'next/navigation';
import React from 'react';

const MainWrapper = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();

    const isLogin = pathname === '/login';
    const isEntry = pathname.includes('/entry/');
    const isVote = pathname.includes('/vote');

    const shouldApplyMargins = !isLogin && !isEntry &&!isVote;

    return (
        <main style={shouldApplyMargins ? { marginTop: '69px', marginLeft: '100px' } : {}}>
            {children}
        </main>
    );
};

export default MainWrapper;