import { ReactNode } from "react";
import { ThemeProvider } from "./theme";
import CssBaseline from "@mui/material/CssBaseline";
import HeaderManager from "./components/HeaderManager";
import MainWrapper from "./components/MainWrapper";

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
            <MainWrapper>{children}</MainWrapper>
        </ThemeProvider>
        </body>
        </html>
    );
}
