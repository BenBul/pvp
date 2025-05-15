"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Alert,
} from "@mui/material";
import { supabase } from "@/supabase/client";

export default function VoteLandingPage() {
    const router = useRouter();
    const [urlInput, setUrlInput] = useState("");
    const [error, setError] = useState("");

    const handleContinue = async () => {
        const input = urlInput.trim();
        let shortCode = "";

        try {
            if (input.startsWith("http")) {
                const parsed = new URL(input);
                const pathParts = parsed.pathname.split("/");
                if (pathParts.length >= 3 && pathParts[1] === "vote") {
                    shortCode = pathParts[2];
                } else {
                    setError("Invalid vote URL. Make sure it contains /vote/{code}");
                    return;
                }
            } else {
                shortCode = input;
            }

            const { data, error: fetchError } = await supabase
                .from("questions")
                .select("id")
                .eq("short_code", shortCode)
                .maybeSingle();

            if (fetchError || !data) {
                setError("Short code not found.");
                return;
            }

            router.push(`/vote/${data.id}`);
        } catch (e) {
            setError("Please enter a valid short code or URL.");
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                bgcolor: "#F8F0FB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 2,
            }}
        >
            <Container
                maxWidth="sm"
                sx={{
                    textAlign: "center",
                    py: 6,
                    px: 4,
                    bgcolor: "white",
                    borderRadius: 4,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                }}
            >
                <Box sx={{ mb: 4 }}>
                    <img
                        src="/logo.svg"
                        alt="Logo"
                        style={{ height: 94, objectFit: "contain" }}
                    />
                </Box>

                <Typography
                    variant="h4"
                    fontWeight={600}
                    sx={{ mb: 3, color: "#211A1D" }}
                >
                    Enter Vote Link
                </Typography>

                <Typography sx={{ mb: 3, color: "#555" }}>
                    Paste the voting link or enter the short code.
                </Typography>

                <TextField
                    fullWidth
                    label="Paste vote URL or short code"
                    variant="outlined"
                    value={urlInput}
                    onChange={(e) => {
                        setError("");
                        setUrlInput(e.target.value);
                    }}
                    sx={{
                        mb: 2,
                        bgcolor: "#fdfdfd",
                        borderRadius: 2,
                    }}
                />

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Button
                    variant="contained"
                    onClick={handleContinue}
                    sx={{
                        backgroundColor: "#6320EE",
                        color: "white",
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                        fontSize: 16,
                        borderRadius: 3,
                        "&:hover": {
                            backgroundColor: "#4f1eb5",
                        },
                    }}
                >
                    Continue
                </Button>
            </Container>
        </Box>
    );
}
