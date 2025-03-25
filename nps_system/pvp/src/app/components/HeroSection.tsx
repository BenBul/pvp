import React from "react";
import { Container } from "react-bootstrap";

export default function HeroSection() {
    return (
        <section style={{ marginTop: "123px", backgroundColor: "#F8F0FB" }}>
            <Container className="d-flex justify-content-start" style={{ paddingLeft: "100px" }}>
            <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-end",
                        flexWrap: "nowrap",
                        gap: "92px",
                        maxWidth: "1314px",
                        width: "100%",
                        height: "484px",
                    }}

                >


                    <div
                        className="d-flex flex-column align-items-center justify-content-start"
                        style={{width: "682px", height: "484px"}}
                    >

                        <div
                            style={{
                                width: "497px",
                                height: "218px",
                                fontFamily: "Roboto",
                                fontSize: "128px",
                                lineHeight: "120%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                                color: "#211A1D",

                                textShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                                padding: "0 24px",
                                marginLeft: "92.5px",

                            }}
                        >
                            PVP
                        </div>


                        <p
                            style={{
                                width: "682px",
                                height: "286px",
                                fontFamily: "Roboto",
                                fontSize: "40px",
                                lineHeight: "120%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                                color: "#211A1D",
                                marginTop: "20px",
                            }}
                        >
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
                            been
                        </p>
                    </div>


                    <div
                        style={{
                            marginLeft: "auto",
                            width: "540px",
                            height: "484px",
                            backgroundColor: "#F1DEDE",
                            borderRadius: "50px",
                        }}
                    />
                </div>
            </Container>
        </section>
    );
}
