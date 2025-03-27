import { ReactNode } from "react";
import { ThemeProvider } from "./theme";
import CssBaseline from "@mui/material/CssBaseline";

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
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
