"use client";

import React from "react";
import { Container } from "react-bootstrap";

export default function Navigation({ onScrollTo }: { onScrollTo: (id: string) => void }) {
    return (
        <div
            style={{
                backgroundColor: "#F8F0FB",
                padding: "49px 79px 32px 50px",
                height: "119px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "641px",
            }}
            
        >
            {/* Logo */}
            <div
                style={{
                    fontFamily: "Inter",
                    fontSize: "32px",
                    color: "#211A1D",
                    width: "762px",
                    height: "38px",
                    display: "flex",
                    alignItems: "center",
                }}
            >
                Logo
            </div>

            {/* Navigation Links */}
            <div
                style={{
                    fontFamily: "Roboto",
                    fontSize: "32px",
                    color: "#211A1D",
                    width: "549px",
                    height: "38px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    whiteSpace: "nowrap", // <- this is key!
                    gap: "32px",           // optional for spacing
                }}
            >
                <a href="#about-us" onClick={(e) => {
                    e.preventDefault();
                    onScrollTo("about-us");
                }} style={{textDecoration: "none", color: "#211A1D"}}>
                    About Us
                </a>
                <a href="#why-us" onClick={(e) => {
                    e.preventDefault();
                    onScrollTo("why-us");
                }} style={{textDecoration: "none", color: "#211A1D"}}>
                    Why Us
                </a>
                <a href="/login" style={{textDecoration: "none", color: "#211A1D"}}>Login</a>
                <a href="#" style={{textDecoration: "none", color: "#211A1D"}}>Register</a>
                <a href="/qr" style={{textDecoration: "none", color: "#211A1D"}}>QR</a>
            </div>
        </div>
    );
}
