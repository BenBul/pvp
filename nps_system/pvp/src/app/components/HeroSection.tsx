"use client";

import React from "react";
import { Box, Container, Typography } from "@mui/material";

export default function HeroSection() {
    return (
        <Box component="section" sx={{ mt: 1, bgcolor: "#F8F0FB", px: { xs: 2, md: 10 }, py: { xs: 6, md: 12 } }}>
            <Container
                disableGutters
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: { xs: 4, md: 10 },
                }}
            >
                <Box sx={{ flex: 1, textAlign: "center" }}>
                    <Typography
                        variant="h1"
                        sx={{
                            fontFamily: "Roboto",
                            fontSize: { xs: "4rem", sm: "6rem", md: "8rem" },
                            color: "#211A1D",
                            textShadow: "0 4px 4px rgba(0,0,0,0.25)",
                            mb: 3,
                        }}
                    >
                        PVP
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            fontFamily: "Roboto",
                            fontSize: { xs: "1.2rem", md: "2rem" },
                            color: "#211A1D",
                            maxWidth: 600,
                            mx: "auto",
                        }}
                    >
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
                    </Typography>
                </Box>

                <Box
                    sx={{
                        flex: 1,
                        bgcolor: "#F1DEDE",
                        borderRadius: 5,
                        aspectRatio: "1 / 1",
                        width: "100%",
                        maxWidth: 500,
                    }}
                />
            </Container>
        </Box>
    );
}
