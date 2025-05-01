import { NextRequest } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
    try {
        const imageUrl = req.nextUrl.searchParams.get('url');
        if (!imageUrl) return new Response('Missing url', { status: 400 });

        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const contentType = response.headers['content-type'] || 'image/png';
        return new Response(response.data, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400'
            }
        });
    } catch (err) {
        return new Response('Error proxying QR image', { status: 500 });
    }
}
