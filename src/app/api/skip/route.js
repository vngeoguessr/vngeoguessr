import { NextResponse } from 'next/server';
import { deleteGameSession } from '../../../lib/session.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'Missing sessionId'
      }, { status: 400 });
    }

    // Clean up the session
    await deleteGameSession(sessionId);

    return NextResponse.json({
      success: true,
      message: 'Session cleaned up'
    });

  } catch (error) {
    console.error('Session cleanup error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to cleanup session'
    }, { status: 500 });
  }
}