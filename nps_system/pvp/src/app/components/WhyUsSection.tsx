"use client";

import React from "react";
import { Container } from "react-bootstrap";

export default function WhyUsSection() {
    return (
        <section id="why-us" style={{ marginTop: "368px" }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <Container
                    style={{
                        width: "1314px",
                        height: "814px",
                        background: "linear-gradient(180deg, #8075FF 0%, #995EE1 100%)",
                        borderRadius: "100px",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "100px 74px",
                    }}
                >
                    <div
                        style={{
                            maxWidth: "568px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "flex-start",
                            fontFamily: "Roboto",
                            color: "#211A1D",
                        }}
                    >
                        <h2
                            style={{
                                fontSize: "72px",
                                fontWeight: "400",
                                lineHeight: "120%",
                                marginBottom: "24px",
                            }}
                        >
                            Why Us
                        </h2>
                        <p
                            style={{
                                fontSize: "32px",
                                lineHeight: "120%",
                            }}
                        >
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
                            been the industry's standard dummy text ever since the 1500s, when an unknown printer took a
                            galley of type.
                        </p>
                    </div>

                    <div
                        style={{
                            width: "536px",
                            height: "585px",
                            backgroundColor: "#F1DEDE",
                            borderRadius: "50px",
                        }}
                    />
                </Container>
            </div>
        </section>
    );
}
