import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        if (!body.userId || !body.proofImageBase64) {
            return NextResponse.json({ error: 'User ID and proof image are required' }, { status: 400 });
        }

        const { db } = await connectToDatabase();

        // 1. Check if bounty exists and is claimable by this user
        const bounty = await db.collection('complaints').findOne({ id });

        if (!bounty) {
            return NextResponse.json({ error: 'Bounty not found' }, { status: 404 });
        }

        if (bounty.status !== 'IN_PROGRESS' || bounty.claimedBy !== body.userId) {
            return NextResponse.json({ error: 'Bounty is not currently claimed by you' }, { status: 400 });
        }

        // 2. Prepare the image for Gemini
        // The image comes as a data URL: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
        const base64Data = body.proofImageBase64.split(',')[1] || body.proofImageBase64;
        const mimeType = body.proofImageBase64.split(';')[0].split(':')[1] || 'image/jpeg';

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType
            },
        };

        // 3. Call Gemini Vision API
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
You are an expert civic infrastructure inspector for a smart city.
A citizen has claimed to have fixed the following issue:
- Issue Type: ${bounty.issueType}
- Location: ${Array.isArray(bounty.areaPath) ? bounty.areaPath.join(', ') : (bounty.areaPath || 'Unknown')}
- Description: ${bounty.description || 'No description provided.'}

Look at the provided proof image.
Does this image clearly show that the issue described above has been resolved, fixed, or cleaned up by the citizen? 
If there's no way to tell, or the image is completely unrelated, say NO. If it looks like a legitimate fix, say YES.

Respond strictly in the following JSON format without markdown blocks:
{
  "approved": true/false,
  "explanation": "A short 1-sentence explanation of what you see and why it is approved or rejected."
}
        `;

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();

        // 4. Parse Gemini's JSON response
        let aiResult = { approved: false, explanation: "Failed to parse AI response" };
        try {
            // Strip out markdown if Gemini adds it despite instructions
            const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            aiResult = JSON.parse(cleanedText);
        } catch (e) {
            console.error('Failed to parse Gemini response:', responseText);
            // Fallback simplistic parsing
            if (responseText.includes('"approved": true') || responseText.includes('YES')) {
                aiResult.approved = true;
                aiResult.explanation = "Approved by AI heuristic fallback.";
            }
        }

        // 5. Apply the result
        if (aiResult.approved) {
            // Mark bounty as resolved
            const reward = bounty.reward || 20; // Default if not set earlier
            await db.collection('complaints').updateOne(
                { id },
                {
                    $set: {
                        status: 'RESOLVED',
                        resolvedAt: Date.now(),
                        aiVerificationExplanation: aiResult.explanation
                    }
                }
            );

            // Award points to user
            await db.collection('users').updateOne(
                { userId: body.userId },
                {
                    $inc: { civicPoints: reward },
                    $setOnInsert: { userId: body.userId, name: 'Civic Hero' }
                },
                { upsert: true }
            );

            return NextResponse.json({
                success: true,
                approved: true,
                message: 'Proof verified! Points awarded.',
                explanation: aiResult.explanation,
                reward
            });
        } else {
            return NextResponse.json({
                success: false,
                approved: false,
                message: 'Proof rejected by AI.',
                explanation: aiResult.explanation
            });
        }

    } catch (error) {
        console.error('POST verify bounty error:', error);
        return NextResponse.json({ error: 'Failed to verify proof' }, { status: 500 });
    }
}
