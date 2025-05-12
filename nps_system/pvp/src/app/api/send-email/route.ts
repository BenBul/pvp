import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    const { email, questionId } = await req.json();

    const link = `http://localhost:3000/vote/${questionId}`;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    });

    try {
        await transporter.sendMail({
            from: `"NPS System" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: 'You are invited to answer a question',
            html: `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      <h2 style="color: #333;">We value your feedback</h2>
      <p style="font-size: 16px; color: #555;">
        Please take a moment to answer a quick question. Your response will help us improve our services.
      </p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${link}" style="background-color: #6320EE; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: bold; display: inline-block;">
          Give Feedback
        </a>
      </p>
      <p style="font-size: 14px; color: #999;">
        If the button above doesn't work, copy and paste this link into your browser:<br />
        <a href="${link}" style="color: #6320EE;">${link}</a>
      </p>
      <hr style="margin: 30px 0;" />
      <p style="font-size: 12px; color: #bbb;">
        Sent by NPS Survey System. If you received this by mistake, simply ignore this message.
      </p>
    </div>
  </div>
`
            ,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Email sending error:', error);
        return NextResponse.json({ error }, { status: 500 });
    }
}
