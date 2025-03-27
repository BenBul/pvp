"use client";

import React from "react";
import { Box, Typography, Button } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function CallToAction() {
    return (
        <Box
            component="section"
            sx={{
                mt: { xs: 8, md: 12 },
                mb: { xs: 6, md: 10 },
                px: 2,
                display: "flex",
                justifyContent: "center",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    gap: 4,
                    maxWidth: 648,
                    width: "100%",
                }}
            >
                <Typography
                    variant="h3"
                    sx={{
                        fontSize: { xs: "2rem", md: "4rem" },
                        fontWeight: 400,
                        fontFamily: "Roboto",
                        lineHeight: "120%",
                        color: "#211A1D",
                    }}
                >
                    Still not sure?
                </Typography>

                <Typography
                    sx={{
                        fontSize: { xs: "1.2rem", md: "2rem" },
                        fontWeight: 400,
                        fontFamily: "Roboto",
                        lineHeight: "120%",
                        color: "#211A1D",
                    }}
                >
                    It’s completely free, give it a try!
                </Typography>

                <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: "1.2rem",
                        fontWeight: 400,
                        fontFamily: "Inter",
                        backgroundColor: "#6320EE",
                        border: "1px solid #767676",
                        borderRadius: "8px",
                        "&:hover": {
                            backgroundColor: "#5316d8",
                        },
                    }}
                >
                    Sign-up
                </Button>
            </Box>
        </Box>
    );
}
