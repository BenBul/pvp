"use client";

import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { ReactNode } from "react";
import CssBaseline from "@mui/material/CssBaseline";

//https://coolors.co/211a1d-6320ee-8075ff-f8f0fb
const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#6320EE",
        },
        secondary: {
            main: "#8075FF",
        },
        background: {
            default: "#F8F0FB"
        },
        text: {
            primary: "#211A1D",
            secondary: "#211A1D",
        }
    },
    typography: {
        fontFamily: "Roboto, sans-serif",
    },
});

export function ThemeProvider({ children }: { children: ReactNode }) {
    return (
        <MuiThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </MuiThemeProvider>
    );
}
