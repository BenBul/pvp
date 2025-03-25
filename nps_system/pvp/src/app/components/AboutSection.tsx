import React from "react";
import { Container } from "react-bootstrap";

export default function AboutSection() {
    return (
        <section id="about-us" style={{ marginTop: "323px" }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
                <Container
                    style={{
                        position: "relative",
                        width: "1314px",
                        height: "754px",
                        background: "linear-gradient(180deg, #8075FF 0%, #995EE1 100%)",
                        borderRadius: "100px",
                    }}
                >

                    <h2
                        style={{
                            position: "absolute",
                            width: "344px",
                            height: "100px",
                            left: "778px",
                            top: "119px",
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
                        About Us
                    </h2>


                    <p
                        style={{
                            position: "absolute",
                            width: "568px",
                            height: "397px",
                            left: "691px",
                            top: "231px",
                            fontFamily: "Roboto",
                            fontSize: "32px",
                            lineHeight: "120%",
                            display: "flex",
                            alignItems: "center",
                            color: "#211A1D",
                        }}
                    >
                        Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of
                        classical Latin literature from 45 BC, making it over 2000 years old. Richard Contrary to
                        popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical
                        Latin literature from 45 BC, making it over 2000 years old. Richard
                    </p>


                    <div
                        style={{
                            position: "absolute",
                            width: "523px",
                            height: "573px",
                            left: "74px",
                            top: "89px",
                            backgroundColor: "#F1DEDE",
                            borderRadius: "50px",
                        }}
                    />
                </Container>
            </div>
        </section>
    );
}
