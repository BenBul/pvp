import React from "react";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import AboutUs from "./components/AboutUs";
import WhyUs from "./components/WhyUs";
import CallToAction from "./components/CallToAction";
import Footer from "./components/Footer";
import { Container } from "react-bootstrap";

export default function Home() {
    return (
        <>
            <Navigation />
            <Container fluid className="px-5"> {/* Added container for better spacing */}
                <Hero />
                <AboutUs />
                <WhyUs />
                <CallToAction />
            </Container>
            <Footer />
        </>
    );
}
