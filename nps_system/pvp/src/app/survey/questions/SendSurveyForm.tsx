'use client';
import { useState } from "react";
import {
    Button,
    TextField,
    Box,
    Alert,
    Typography,
    Link,
    IconButton,
    Tooltip
} from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShortCodeModal from './ShortCodeModal';

export default function SendSurveyForm({
                                           questionId,
                                           shortCode: initialShortCode
                                       }: {
    questionId: string;
    shortCode: string | null;
}) {
    const [emailsInput, setEmailsInput] = useState("");
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [invalids, setInvalids] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);
    const [shortCode, setShortCode] = useState(initialShortCode);
    const [modalOpen, setModalOpen] = useState(false);

    const link = `http://localhost:3000/vote/${questionId}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const handleSend = async () => {
        const rawEmails = emailsInput
            .split(",")
            .map((e) => e.trim())
            .filter((e) => e.length > 0);

        const validEmails = rawEmails.filter((email) =>
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        );
        const invalidEmails = rawEmails.filter((email) => !validEmails.includes(email));

        if (validEmails.length === 0) {
            setStatus("error");
            setInvalids(invalidEmails);
            return;
        }

        try {
            const results = await Promise.all(
                validEmails.map((email) =>
                    fetch("/api/send-email", {
                        method: "POST",
                        body: JSON.stringify({ email, questionId }),
                        headers: { "Content-Type": "application/json" },
                    })
                )
            );

            const allOk = results.every((res) => res.ok);
            setStatus(allOk ? "success" : "error");
            setInvalids(invalidEmails);
            if (allOk) setEmailsInput("");
        } catch {
            setStatus("error");
        }
    };

    return (
        <Box sx={{ mt: 2 }}>
            {shortCode ? (
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                    Short code: <strong>{shortCode}</strong>
                </Typography>
            ) : (
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                    No short code assigned.{" "}
                    <Link component="button" onClick={() => setModalOpen(true)}>
                        Click here to create one.
                    </Link>
                </Typography>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2">
                    Your link:{" "}
                    <Link href={link} target="_blank" rel="noopener noreferrer">
                        {link}
                    </Link>
                </Typography>
                <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
                    <IconButton size="small" onClick={handleCopy}>
                        <ContentCopyIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>

            <TextField
                label="Recipient email(s) – separate with commas"
                value={emailsInput}
                onChange={(e) => {
                    setStatus("idle");
                    setEmailsInput(e.target.value);
                }}
                fullWidth
                size="small"
                sx={{ mb: 1 }}
            />

            <Button variant="outlined" onClick={handleSend}>
                Send Email
            </Button>

            {status === "success" && (
                <Alert severity="success" sx={{ mt: 1 }}>
                    Email(s) sent successfully!
                </Alert>
            )}
            {status === "error" && (
                <Alert severity="error" sx={{ mt: 1 }}>
                    Failed to send. Please check the email format.
                </Alert>
            )}

            {invalids.length > 0 && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                    Invalid email(s): {invalids.join(", ")}
                </Alert>
            )}

            <ShortCodeModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                questionId={questionId}
                onShortCodeCreated={(newCode) => setShortCode(newCode)}
            />
        </Box>
    );
}
