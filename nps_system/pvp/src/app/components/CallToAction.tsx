import React from "react";
import { Container, Button } from "react-bootstrap";

export default function CallToAction() {
    return (
        <Container className="text-center py-5">
            <h2 className="display-5 fw-bold">Still not sure?</h2>
            <p className="fs-4">It’s completely free, give it a try!</p>
            <Button variant="primary" className="mt-3 fs-5 px-4 py-2">Sign-up →</Button>
        </Container>
    );
}
