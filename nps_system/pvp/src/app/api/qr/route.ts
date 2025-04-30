import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
    try {
        const { color, body, URL, logo } = await request.json();

        const url = 'https://api.qrcode-monkey.com//qr/custom';

        const payload = {
            data: URL,
            config: {
                body: body || "square",
                eye: "frame0",
                eyeBall: "ball0",
                erf1: [],
                erf2: [],
                erf3: [],
                brf1: [],
                brf2: [],
                brf3: [],
                bodyColor: color || "#000000",
                bgColor: "#FFFFFF",
                eye1Color: color || "#000000",
                eye2Color: color || "#000000",
                eye3Color: color || "#000000",
                eyeBall1Color: color || "#000000",
                eyeBall2Color: color || "#000000",
                eyeBall3Color: color || "#000000",
                gradientColor1: "",
                gradientColor2: "",
                gradientType: "linear",
                gradientOnEyes: "true",
                logo: logo || "",
                logoMode: logo ? "default" : ""
            },
            size: 1000,
            download: "imageUrl",
            file: "png"
        };

        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const imageUrl = response.data.imageUrl;
        return NextResponse.json({ url: imageUrl });
    } catch (error) {
        console.error('Error generating QR code:', error);
        return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
    }
}