import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
    try {
        const { color } = await request.json();

        const url = 'https://api.qrcode-monkey.com//qr/custom';

        const payload = {
            data: "https://www.qrcode-monkey.com",
            config: {
                body: "square",
                eye: "frame0",
                eyeBall: "ball0",
                erf1: [],
                erf2: [],
                erf3: [],
                brf1: [],
                brf2: [],
                brf3: [],
                bodyColor: color,
                bgColor: "#FFFFFF",
                eye1Color: color,
                eye2Color: color,
                eye3Color: color,
                eyeBall1Color: color,
                eyeBall2Color: color,
                eyeBall3Color: color,
                gradientColor1: "",
                gradientColor2: "",
                gradientType: "linear",
                gradientOnEyes: "true",
                logo: "",
                logoMode: "default"
            },
            size: 1000,
            download: "imageUrl",
            file: "svg"
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
