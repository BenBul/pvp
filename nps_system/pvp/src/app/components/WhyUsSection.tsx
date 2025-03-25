"use client";

import React from "react";
import { Container } from "react-bootstrap";

export default function WhyUsSection() {
    return (
        <section style={{ marginTop: "368px", display: "flex", justifyContent: "center" }}>
            <Container
                style={{
                    position: "relative",
                    width: "1314px",
                    height: "814px",
                    background: "linear-gradient(180deg, #8075FF 0%, #995EE1 100%)",
                    borderRadius: "100px",
                }}
            >
                {/* Heading */}
                <h2
                    style={{
                        position: "absolute",
                        width: "240px",
                        height: "86px",
                        left: "185px",
                        top: "180px",
                        fontFamily: "Roboto",
                        fontSize: "72px",
                        fontWeight: "400",
                        lineHeight: "120%",
                        display: "flex",
                        alignItems: "center",
                        textAlign: "center",
                        color: "#211A1D",
                    }}
                >
                    Why Us
                </h2>

                {/* Description Text */}
                <p
                    style={{
                        position: "absolute",
                        width: "547px",
                        top: "55%",
                        left: "25%",
                        transform: "translate(-50%, -50%)",
                        fontFamily: "Roboto",
                        fontSize: "36px",
                        fontWeight: "400",
                        lineHeight: "120%",
                        display: "flex",
                        alignItems: "center",
                        textAlign: "center",
                        color: "#211A1D",
                    }}
                >
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's
                    standard dummy text ever since the 1500s, when an unknown printer took a galley of type.
                </p>

                {/* Pink Rectangle */}
                <div
                    style={{
                        position: "absolute",
                        width: "536px",
                        height: "585px",
                        right: "50px",
                        top: "100px",
                        backgroundColor: "#F1DEDE",
                        borderRadius: "50px",
                    }}
                ></div>
            </Container>
        </section>
    );
}
