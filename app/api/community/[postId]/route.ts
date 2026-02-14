import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ postId: string }> }
) {
    try {
        const { postId } = await params;
        const body = await req.json();
        const { db } = await connectToDatabase();
        const collection = db.collection('community_posts');

        // Upvote action
        if (body.action === 'upvote' && body.userPhone) {
            const post = await collection.findOne({ id: postId });
            if (!post) {
                return NextResponse.json({ error: 'Post not found' }, { status: 404 });
            }

            const alreadyVoted = (post.upvotedBy as string[]).includes(body.userPhone);

            if (alreadyVoted) {
                await collection.updateOne(
                    { id: postId },
                    { $inc: { upvotes: -1 }, $pull: { upvotedBy: body.userPhone } }
                );
            } else {
                await collection.updateOne(
                    { id: postId },
                    { $inc: { upvotes: 1 }, $push: { upvotedBy: body.userPhone } }
                );
            }

            const updated = await collection.findOne({ id: postId });
            return NextResponse.json({ success: true, post: updated });
        }

        // Reply action
        if (body.action === 'reply' && body.reply) {
            const reply = {
                id: `cr-${Date.now()}`,
                ...body.reply,
                timestamp: Date.now(),
            };

            await collection.updateOne(
                { id: postId },
                { $push: { replies: reply } }
            );

            return NextResponse.json({ success: true, reply });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('PATCH community post error:', error);
        return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }
}
