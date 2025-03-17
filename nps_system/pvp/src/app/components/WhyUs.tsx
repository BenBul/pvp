import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

export default function WhyUs() {
    return (
        <Container className="my-5">
            <Row className="align-items-center p-5 rounded-4 text-white" style={{
                background: 'linear-gradient(180deg, #8075FF 0%, #995EE1 100%)',
                borderRadius: '50px'
            }}>
                <Col md={6}>
                    <h2 className="fw-bold text-dark">Why Us</h2>
                    <p className="text-dark">
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
                    </p>
                </Col>
                <Col md={6} className="d-flex justify-content-center">
                    <div style={{
                        width: '300px',
                        height: '300px',
                        background: '#F1DEDE',
                        borderRadius: '30px'
                    }}></div>
                </Col>
            </Row>
        </Container>
    );
}
