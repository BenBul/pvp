import React from "react";
import { Container, Button } from "react-bootstrap";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function CallToAction() {
    return (
        <section
            style={{
                marginTop: "100px",
                marginBottom: "80px",
                display: "flex",
                justifyContent: "center",
            }}
        >
            <Container
                style={{
                    width: "1314px",
                    height: "821px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "46px",
                        textAlign: "center",
                        maxWidth: "648px",
                    }}
                >
                    <h2
                        style={{
                            fontSize: "64px",
                            fontWeight: 400,
                            fontFamily: "Roboto",
                            lineHeight: "120%",
                            color: "#211A1D",
                        }}
                    >
                        Still not sure?
                    </h2>
                    <p
                        style={{
                            fontSize: "32px",
                            fontWeight: 400,
                            fontFamily: "Roboto",
                            lineHeight: "120%",
                            color: "#211A1D",
                        }}
                    >
                        It’s completely free, give it a try!
                    </p>

                    <Button
                        style={{
                            width: "229px",
                            height: "65px",
                            backgroundColor: "#6320EE",
                            border: "1px solid #767676",
                            borderRadius: "8px",
                            fontSize: "24px",
                            fontWeight: 400,
                            fontFamily: "Inter",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        Sign-up <ArrowForwardIcon fontSize="medium" />
                    </Button>
                </div>
            </Container>
        </section>
    );
}
