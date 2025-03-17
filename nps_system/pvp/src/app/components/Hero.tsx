import React from "react";
import { Container, Row, Col } from "react-bootstrap";

export default function Hero() {
    return (
        <Container className="text-center my-5">
            <Row className="align-items-center">
                <Col md={6}>
                    <h1 className="display-1 fw-bold">PVP</h1>
                    <p className="fs-4">
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                    </p>
                </Col>
                <Col md={6}>
                    <div className="bg-secondary rounded-3" style={{ width: "100%", height: "300px" }}></div>
                </Col>
            </Row>
        </Container>
    );
}
