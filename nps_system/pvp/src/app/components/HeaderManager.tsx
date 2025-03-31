'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import DefaultHeader from './headers/DefaultHeader';
import SurveyHeader from './headers/SurveyHeader';

export default function HeaderManager() {
  const pathname = usePathname();
  const isSurveyDetailPage = pathname.startsWith('/survey');

  return isSurveyDetailPage ? <SurveyHeader /> : <DefaultHeader />;
}