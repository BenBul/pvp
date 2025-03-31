// app/layout.tsx
import { ReactNode } from "react";
import { ThemeProvider } from "./theme";
import CssBaseline from "@mui/material/CssBaseline";
import HeaderManager from "./components/HeaderManager";

export const metadata = {
    title: "PVP NPS APP",
    description: "By Šefai",
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body>
                <ThemeProvider>
                    <CssBaseline />
                    <HeaderManager />
                    <main>
                        {children}
                    </main>
                </ThemeProvider>
            </body>
        </html>
    );
}