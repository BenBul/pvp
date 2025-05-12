"use client";

import React, { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function SurveyAccess() {
    const [url, setUrl] = useState("");
    const router = useRouter();

    const handleAccess = () => {
        try {
            const fullUrl = new URL(url);
            const path = fullUrl.pathname;
            router.push(path);
        } catch (error) {
            alert("Invalid URL. Please make sure you paste the full survey link.");
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "70vh",
                px: 2,
                textAlign: "center",
            }}
        >
            <Typography variant="h4" sx={{ mb: 4 }}>
                Access a Survey
            </Typography>

            <TextField
                label="Paste your survey link"
                variant="outlined"
                fullWidth
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                sx={{ maxWidth: 600, mb: 3 }}
            />

            <Button
                variant="contained"
                onClick={handleAccess}
                sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: "1rem",
                    backgroundColor: "#6320EE",
                    "&:hover": {
                        backgroundColor: "#5316d8",
                    },
                }}
            >
                Go
            </Button>
        </Box>
    );
}
