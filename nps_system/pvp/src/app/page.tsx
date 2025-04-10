"use client";

import React, { useRef } from "react";
import Navigation from "./components/Navigation";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import WhyUsSection from "./components/WhyUsSection";
import CallToAction from "./components/CallToAction";
import Footer from "./components/Footer";



export default function Home() {
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <main style={{ backgroundColor: "#F8F0FB" }}>
            <HeroSection />
            <AboutSection />
            <WhyUsSection />
            <CallToAction />
            <Footer />
        </main>
    );
}