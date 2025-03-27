"use client";

import React from "react";
import { Box, Typography } from "@mui/material";

export default function AboutSection() {
    return (
        <Box
            id="about-us"
            component="section"
            sx={{
                mt: { xs: 8, md: 16 },
                px: { xs: 2, md: 6 },
                py: { xs: 4, md: 10 },
                display: "flex",
                flexDirection: { xs: "column-reverse", md: "row" },
                alignItems: "center",
                justifyContent: "center",
                gap: { xs: 4, md: 8 },
                borderRadius: "60px",
                background: "linear-gradient(180deg, #8075FF 0%, #995EE1 100%)",
                maxWidth: 1200,
                mx: "auto",
            }}
        >
            <Box
                sx={{
                    flex: "1 1 240px",
                    minWidth: 200,
                    maxWidth: 320,
                    bgcolor: "#F1DEDE",
                    borderRadius: 5,
                    aspectRatio: "3 / 4",
                    mx: "auto",
                }}
            />

            <Box
                sx={{
                    flex: "2 1 300px",
                    fontFamily: "Roboto",
                    color: "#211A1D",
                    textAlign: { xs: "center", md: "left" },
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    gap: 2,
                    maxWidth: 550,
                    width: "100%",
                }}
            >
                <Typography
                    variant="h3"
                    sx={{
                        fontSize: { xs: "1.8rem", md: "3rem" },
                        fontWeight: 400,
                        lineHeight: "120%",
                    }}
                >
                    About Us
                </Typography>

                <Typography
                    variant="body1"
                    sx={{
                        fontSize: { xs: "0.95rem", md: "1.2rem" },
                        lineHeight: "150%",
                    }}
                >
                    Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of
                    classical Latin literature from 45 BC, making it over 2000 years old. Richard Contrary to popular
                    belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature
                    from 45 BC, making it over 2000 years old. Richard
                </Typography>
            </Box>
        </Box>
    );
}