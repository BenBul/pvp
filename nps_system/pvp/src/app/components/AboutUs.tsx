import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

export default function AboutUs() {
    return (
        <Container className="my-5">
            <Row className="align-items-center p-5 rounded-4 text-white" style={{
                background: 'linear-gradient(180deg, #8075FF 0%, #995EE1 100%)',
                borderRadius: '50px'
            }}>
                <Col md={6} className="d-flex justify-content-center">
                    <div style={{
                        width: '300px',
                        height: '300px',
                        background: '#F1DEDE',
                        borderRadius: '30px'
                    }}></div>
                </Col>
                <Col md={6}>
                    <h2 className="fw-bold text-dark">About Us</h2>
                    <p className="text-dark">
                        Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in classical Latin literature from 45 BC, making it over 2000 years old. Richard Contrary to popular belief, Lorem Ipsum is not simply random text.
                    </p>
                </Col>
            </Row>
        </Container>
    );
}
