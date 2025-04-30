// src/app/api/qr/fetch-svg/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
    const svgUrl = req.nextUrl.searchParams.get('url');

    if (!svgUrl) {
        return NextResponse.json({ error: 'Missing SVG URL' }, { status: 400 });
    }

    try {
        const response = await axios.get(svgUrl, {
            responseType: 'text',
        });

        return new NextResponse(response.data, {
            headers: {
                'Content-Type': 'image/svg+xml',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error('Failed to fetch SVG:', error);
        return NextResponse.json({ error: 'Failed to fetch SVG' }, { status: 500 });
    }
}
