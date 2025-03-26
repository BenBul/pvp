"use client";

import React from "react";
import { Container } from "react-bootstrap";

const linkStyle: React.CSSProperties = {
    textDecoration: "none",
    color: "#211A1D",
    cursor: "pointer",
    display: "inline-block",
    transition: "color 0.3s ease",
    fontFamily: "Roboto",
    fontSize: "32px",
};

export default function Navigation({ onScrollTo }: { onScrollTo: (id: string) => void }) {
    return (
        <header
            style={{
                backgroundColor: "#F8F0FB",
                height: "119px",
                display: "flex",
                alignItems: "center",
            }}
        >
            <Container
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0 50px",
                    gap: "641px",
                }}
            >
                <div
                    style={{
                        fontFamily: "Inter",
                        fontSize: "32px",
                        color: "#211A1D",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    Logo
                </div>

                <nav
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "32px",
                        whiteSpace: "nowrap",
                    }}
                >
                    <a
                        href="#about-us"
                        onClick={(e) => {
                            e.preventDefault();
                            onScrollTo("about-us");
                        }}
                        style={linkStyle}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#6320EE")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#211A1D")}
                    >
                        About Us
                    </a>

                    <a
                        href="#why-us"
                        onClick={(e) => {
                            e.preventDefault();
                            onScrollTo("why-us");
                        }}
                        style={linkStyle}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#6320EE")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#211A1D")}
                    >
                        Why Us
                    </a>

                    <a
                        href="/login"
                        style={linkStyle}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#6320EE")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#211A1D")}
                    >
                        Login
                    </a>

                    <a
                        href="#"
                        style={linkStyle}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#6320EE")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#211A1D")}
                    >
                        Register
                    </a>

                    <a
                        href="/qr"
                        style={linkStyle}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#6320EE")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#211A1D")}
                    >
                        QR
                    </a>
                </nav>
            </Container>
        </header>
    );
}
