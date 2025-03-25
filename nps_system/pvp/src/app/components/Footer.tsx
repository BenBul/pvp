import React from "react";

export default function Footer() {
    return (
        <footer
            style={{
                width: "1440px",
                height: "136px",
                background: "#F8F0FB",
                borderRadius: "0px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
            }}
        >
            <div
                style={{
                    fontFamily: "Inter",
                    fontStyle: "normal",
                    fontWeight: 400,
                    fontSize: "20px",
                    lineHeight: "120%",
                    textAlign: "center",
                    color: "#000000",
                    width: "75px",
                    height: "24px",
                }}
            >
                By šefai
            </div>
        </footer>
    );
}
