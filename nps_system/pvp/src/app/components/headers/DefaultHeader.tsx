'use client';

import React from 'react';
import Navigation from '../Navigation';

export default function DefaultHeader() {
  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return <Navigation onScrollTo={handleScrollTo} />;
}