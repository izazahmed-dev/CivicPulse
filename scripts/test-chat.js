// Native fetch is available in Node 18+

async function testChat() {
    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'What is the capital of France?' }]
            })
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('Error:', response.status, text);
        } else {
            const data = await response.json();
            console.log('Response:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('Request failed:', error);
    }
}

testChat();
