const fs = require('fs');

async function testVoiceComplaint() {
    try {
        console.log("Sending test request to existing local API...");
        const res = await fetch('http://localhost:3000/api/voice-complaint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                audio: 'UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA', // Tiny valid wav base64
                mimeType: 'audio/wav',
                transcript: ''
            })
        });
        const data = await res.json();
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}

testVoiceComplaint();
