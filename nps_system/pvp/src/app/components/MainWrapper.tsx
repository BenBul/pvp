'use client';

import { usePathname } from 'next/navigation';
import React from 'react';

const MainWrapper = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();

    const isLogin = pathname === '/login';

    return (
        <main style={isLogin ? {} : { marginTop: '69px', marginLeft: '100px' }}>
            {children}
        </main>
    );
};

export default MainWrapper;
