"use client";  // Fixes Next.js client component issue

import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";

export default function Navigation() {
    return (
        <Navbar expand="lg" className="bg-light shadow-sm py-3">
            <Container>
                <Navbar.Brand href="#" className="fs-3 fw-bold">Logo</Navbar.Brand>
                <Navbar.Toggle aria-controls="navbar-nav" />
                <Navbar.Collapse id="navbar-nav" className="justify-content-end">
                    <Nav>
                        <Nav.Link href="#" className="fs-5 mx-2">About Us</Nav.Link>
                        <Nav.Link href="#" className="fs-5 mx-2">Why Us</Nav.Link>
                        <Nav.Link href="#" className="fs-5 mx-2">Login</Nav.Link>
                        <Nav.Link href="#" className="fs-5 mx-2">Register</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}
