import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json().catch(() => ({}));
    const expectedPassword = process.env.APP_PASSWORD;

    // If no password is set on server, allow entry
    if (!expectedPassword) {
      const response = NextResponse.json({ success: true, warning: 'No APP_PASSWORD set' });
      return response;
    }

    if (!password || password !== expectedPassword) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz yönetici şifresi.' },
        { status: 401 }
      );
    }

    const token = Buffer.from(expectedPassword).toString('base64');
    const response = NextResponse.json({ success: true });

    response.cookies.set({
      name: 'shoppulse_auth',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Giriş işlemi sırasında hata oluştu.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('shoppulse_auth');
  return response;
}
