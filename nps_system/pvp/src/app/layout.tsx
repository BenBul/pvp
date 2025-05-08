import { ReactNode } from "react";
import { ThemeProvider } from "./theme";
import CssBaseline from "@mui/material/CssBaseline";
import HeaderManager from "./components/HeaderManager";
import TopBar from "./components/TopBar"; // <- pridėta

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
            <main style={{ marginTop: '69px', marginLeft: '100px' }}>
                {children}
            </main>
        </ThemeProvider>
        </body>
        </html>
    );
}
