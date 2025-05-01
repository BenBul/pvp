import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
    try {
        // Get the URL from query params
        const url = new URL(request.url);
        const imageUrl = url.searchParams.get('url');

        if (!imageUrl) {
            return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
        }

        console.log('Fetching QR code from:', imageUrl);

        // Fetch the image
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            headers: {
                // Some APIs require a user agent
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            // Important: Set a reasonable timeout
            timeout: 10000
        });

        // Determine content type (default to PNG if not specified)
        const contentType = response.headers['content-type'] || 'image/png';

        console.log('Image fetched successfully, content type:', contentType);

        // Return the image with appropriate headers
        // Note: We're NOT setting Content-Disposition: attachment here, as it can cause issues in some cases
        return new NextResponse(response.data, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400', // Cache for a day
                // Add CORS headers
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        });
    } catch (error) {
        console.error('Error proxying QR code image:', error);

        // Return a more detailed error response
        return NextResponse.json({
            error: 'Failed to fetch QR code image',
            message: error instanceof Error ? error.message : 'Unknown error',
            url: new URL(request.url).searchParams.get('url') || 'No URL provided'
        }, {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}