"use client";

import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";

export default function Page() {
    const [imageUrl, setImageUrl] = useState("");
    const [error, setError] = useState("");
    const [color, setColor] = useState("#000001"); // Single color state

    const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setColor(event.target.value); // Update the single color state
    };

    const generateQRCode = async () => {
        try {
            const response = await fetch("/api/qr", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ color }), // Send the single color to the API
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch QR code: ${response.statusText}`);
            }

            const data = await response.json();
            setImageUrl(data.url);
            setError("");
        } catch (error) {
            console.error("Error generating QR code:", error);
            setError("Failed to load QR code. Please try again later.");
        }
    };

    return (
        <div>
            <nav className="navbar">
                <div className="logo">Logo</div>
                <div className="nav-links">
                    <Link href="/">Home</Link>
                </div>
            </nav>

            <div className="color-picker">
                <label>
                    QR Code Color:
                    <input
                        type="color"
                        value={color}
                        onChange={handleColorChange}
                    />
                </label>
            </div>

            <button onClick={generateQRCode}>Generate QR Code</button>

            {error ? (
                <p>{error}</p>
            ) : imageUrl ? (
                <Image
                    alt="QR Code"
                    src={imageUrl}
                    width={500}
                    height={500}
                />
            ) : (
                <p>No QR code generated yet. Click the button to generate one.</p>
            )}
        </div>
    );
}