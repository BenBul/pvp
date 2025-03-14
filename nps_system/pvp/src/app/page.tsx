"use client";

import React, { useRef } from "react";
import Link from "next/link";

export default function Home() {

    const aboutUsRef = useRef(null);
    const whyUsRef = useRef(null);

    const scrollToSection = (elementRef) => {
        elementRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    };

    return (
        <div>
            {/* NAVIGATION */}
            <nav className="navbar">
                <div className="logo">Logo</div>
                <div className="nav-links">
                    <a href="#about-us" onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(aboutUsRef);
                    }}>About Us</a>
                    <a href="#why-us" onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(whyUsRef);
                    }}>Why Us</a>
                    <a href="#">Login</a>
                    <a href="#">Register</a>
                    <Link href="/qr">QR</Link>
                </div>
            </nav>

            {/* HERO SECTION - Frame 5 */}
            <section className="hero">
                <div className="hero-content">
                    <h1>PVP</h1>
                    <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been</p>
                </div>
                <div className="hero-image"></div>
            </section>

            {/* FRAME 10 - Container for About Us & Why Us */}
            <section className="frame-10">
                {/* FRAME 7 - About Us Section */}
                <div id="about-us" ref={aboutUsRef} className="frame-7">
                    <h2>About Us</h2>
                    <p className="about-text">
                        Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard Contrary to popular belief, Lorem Ipsum is not simply random text.
                        It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard
                    </p>
                    <div className="about-image"></div>
                </div>

                {/* FRAME 9 - Why Us Section */}
                <div id="why-us" ref={whyUsRef} className="frame-9">
                    <h2>Why Us</h2>
                    <p className="why-text">
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type.
                    </p>
                    <div className="why-image"></div>
                </div>
            </section>

            {/* FRAME 16 - Call to Action Section */}
            <section className="frame-16">
                {/* FRAME 13 - Text Container */}
                <div className="frame-13">
                    <h2>Still not sure?</h2>
                    <p>It's completely free, give it a try!</p>
                </div>

                {/* BUTTON with Correct 46px Gap */}
                <button className="button">Sign-up →</button>
            </section>

            {/* FRAME 15 - Empty Section to Hold Footer Gap */}
            <div className="frame-15"></div>

            {/* FRAME 14 - Footer (NOW FIXED) */}
            <footer className="frame-14">
                <p className="footer-text">By Šefai</p>
            </footer>
        </div>
    );
}