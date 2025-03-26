"use client";

import React from "react";
import { Box, Typography } from "@mui/material";

export default function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                bgcolor: "#F8F0FB",
                py: 4,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mt: { xs: 8, md: 12 },
            }}
        >
            <Typography
                sx={{
                    fontFamily: "Inter",
                    fontWeight: 400,
                    fontSize: "1.25rem",
                    lineHeight: "120%",
                    color: "#000000",
                    textAlign: "center",
                }}
            >
                By šefai
            </Typography>
        </Box>
    );
}