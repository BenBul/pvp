import axios from 'axios';

async function generateQRCode(): Promise<string> {
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
            bodyColor: "#A23F3F",
            bgColor: "#FFFFFF",
            eye1Color: "#A23F3F",
            eye2Color: "#A23F3F",
            eye3Color: "#A23F3F",
            eyeBall1Color: "#A23F3F",
            eyeBall2Color: "#A23F3F",
            eyeBall3Color: "#A23F3F",
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
    console.log('Payload:', url);

    try {
        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('API Response:', response);

        // The response contains the URL to the SVG image
        const imageUrl = response.data.imageUrl;
        console.log('Image URL:', response.data.imageUrl);
        return imageUrl;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
    }

}
async function displayQRCode() {
    try {
        const imageUrl = await generateQRCode();
        console.log('QR Code Image URL:', imageUrl);

        // Display the image in an <img> tag
        const imgElement = document.createElement('img');
        imgElement.src = imageUrl;
        imgElement.alt = 'Generated QR Code';
        document.body.appendChild(imgElement);

        // Optionally, provide a download link
        const downloadLink = document.createElement('a');
        downloadLink.href = imageUrl;
        downloadLink.download = 'qrcode.svg'; // Name of the downloaded file
        downloadLink.textContent = 'Download QR Code';
        document.body.appendChild(downloadLink);
    } catch (error) {
        console.error('Failed to display QR code:', error);
    }
}

// Call the function to display the QR code
displayQRCode();

