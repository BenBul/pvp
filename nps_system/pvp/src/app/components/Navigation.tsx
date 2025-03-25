"use client";

import React from "react";

const linkStyle: React.CSSProperties = {
    textDecoration: "none",
    color: "#211A1D",
    cursor: "pointer",
    display: "inline-block",
    transition: "color 0.3s ease",
};

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
                    whiteSpace: "nowrap",
                    gap: "32px",
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
            </div>
        </div>
    );
}
