import React from "react";
import { Container } from "react-bootstrap";

export default function AboutSection() {
    return (
        <section id="about-us" style={{ marginTop: "323px" }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    paddingRight: "100px",
                }}
            >
                <Container
                    style={{
                        width: "1314px",
                        height: "754px",
                        background: "linear-gradient(180deg, #8075FF 0%, #995EE1 100%)",
                        borderRadius: "100px",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "89px 74px",
                    }}
                >
                    <div
                        style={{
                            width: "523px",
                            height: "573px",
                            backgroundColor: "#F1DEDE",
                            borderRadius: "50px",
                        }}
                    />

                    <div
                        style={{
                            maxWidth: "568px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-start",
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
                            About Us
                        </h2>
                        <p
                            style={{
                                fontSize: "32px",
                                lineHeight: "120%",
                            }}
                        >
                            Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece
                            of classical Latin literature from 45 BC, making it over 2000 years old. Richard Contrary to
                            popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical
                            Latin literature from 45 BC, making it over 2000 years old. Richard
                        </p>
                    </div>
                </Container>
            </div>
        </section>
    );
}
