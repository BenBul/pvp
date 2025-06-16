"use client";

import AuthGuard from './AuthGuard';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  return <AuthGuard>{children}</AuthGuard>;
} 