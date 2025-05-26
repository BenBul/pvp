// app/api/send-invitation/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email, organizationId, organizationName, invitedBy } = await request.json();

    // Validate required fields
    if (!email || !organizationId || !organizationName || !invitedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' }, 
        { status: 400 }
      );
    }

    // Check if user already exists in organization
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .eq('organization', organizationId)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User is already a member of this organization' }, 
        { status: 409 }
      );
    }

    // Check if invitation already exists
    const { data: existingInvitation } = await supabase
      .from('organization_invitations')
      .select('id')
      .eq('email', email)
      .eq('organization_id', organizationId)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'An invitation has already been sent to this email' }, 
        { status: 409 }
      );
    }

    // Verify that the inviter is the organization owner
    const { data: organization } = await supabase
      .from('organizations')
      .select('owner_id')
      .eq('id', organizationId)
      .single();

    if (!organization || organization.owner_id !== invitedBy) {
      return NextResponse.json(
        { error: 'Only organization owners can send invitations' }, 
        { status: 403 }
      );
    }

    // Create invitation record
    const invitationId = crypto.randomUUID();
    const { error: inviteError } = await supabase
      .from('organization_invitations')
      .insert({
        id: invitationId,
        organization_id: organizationId,
        email: email,
        invited_by: invitedBy,
        status: 'pending'
      });

    if (inviteError) {
      console.error('Database error:', inviteError);
      return NextResponse.json(
        { error: 'Failed to create invitation' }, 
        { status: 500 }
      );
    }

    // Generate invitation link
    const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${invitationId}`;

    // Send email using nodemailer
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    });

    try {
        await transporter.sendMail({
            from: `"Organization System" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: `Invitation to join ${organizationName}`,
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
                <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                  <h2 style="color: #333; text-align: center;">You're invited to join ${organizationName}!</h2>
                  <p style="font-size: 16px; color: #555; text-align: center;">
                    You've been invited to join the organization <strong>${organizationName}</strong>. 
                    Click the button below to accept the invitation and become a team member.
                  </p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${invitationLink}" style="background-color: #1976d2; color: white; padding: 15px 30px; border-radius: 5px; text-decoration: none; font-weight: bold; display: inline-block; font-size: 16px;">
                      Accept Invitation
                    </a>
                  </div>
                  <p style="font-size: 14px; color: #999; text-align: center;">
                    If the button above doesn't work, copy and paste this link into your browser:<br />
                    <a href="${invitationLink}" style="color: #1976d2; word-break: break-all;">${invitationLink}</a>
                  </p>
                  <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
                  <p style="font-size: 12px; color: #bbb; text-align: center;">
                    This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.<br />
                    Sent by Organization Management System.
                  </p>
                </div>
              </div>
            `,
        });

        return NextResponse.json({ 
          success: true, 
          message: 'Invitation sent successfully',
          invitationId 
        });

    } catch (emailError) {
        console.error('Email sending error:', emailError);
        
        // If email fails, remove the invitation record
        await supabase
          .from('organization_invitations')
          .delete()
          .eq('id', invitationId);

        return NextResponse.json(
          { error: 'Failed to send invitation email' }, 
          { status: 500 }
        );
    }

  } catch (error) {
    console.error('Invitation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}