"use client";

import React from "react";
import { AppBar, Box, Container, Toolbar, Typography, Link } from "@mui/material";

const navLinks = [
    { label: "About Us", id: "about-us" },
    { label: "Why Us", id: "why-us" },
    { label: "Login", href: "/login" },
    { label: "Register", href: "#" },
    { label: "QR", href: "/qr" },
];

export default function Navigation({ onScrollTo }: { onScrollTo: (id: string) => void }) {
    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                backgroundColor: "#F8F0FB",
                height: "119px",
                justifyContent: "center",
            }}
        >
            <Container maxWidth={false} sx={{ px: { xs: 2, md: 6 } }}>
                <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
                    <Typography
                        sx={{
                            fontFamily: "Inter",
                            fontSize: "32px",
                            color: "#211A1D",
                        }}
                    >
                        Logo
                    </Typography>

                    <Box
                        sx={{
                            display: "flex",
                            gap: "32px",
                            whiteSpace: "nowrap",
                            alignItems: "center",
                        }}
                    >
                        {navLinks.map((link) =>
                            link.id ? (
                                <Link
                                    key={link.label}
                                    component="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onScrollTo(link.id!);
                                    }}
                                    underline="none"
                                    sx={{
                                        fontFamily: "Roboto",
                                        fontSize: "32px",
                                        color: "#211A1D",
                                        cursor: "pointer",
                                        transition: "color 0.3s",
                                        "&:hover": { color: "#6320EE" },
                                    }}
                                >
                                    {link.label}
                                </Link>
                            ) : (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    underline="none"
                                    sx={{
                                        fontFamily: "Roboto",
                                        fontSize: "32px",
                                        color: "#211A1D",
                                        cursor: "pointer",
                                        transition: "color 0.3s",
                                        "&:hover": { color: "#6320EE" },
                                    }}
                                >
                                    {link.label}
                                </Link>
                            )
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
