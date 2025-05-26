'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Container, Typography, Box, Button, Alert, CircularProgress, Paper, Divider
} from '@mui/material';
import { CheckCircle, Error, Group } from '@mui/icons-material';
import { session, supabase } from '@/supabase/client';
import { createClient } from '@supabase/supabase-js';

interface IInvitation {
    id: string;
    organization_id: string;
    email: string;
    status: string;
    created_at: string;
    organizations: {
        title: string;
    };
}

export default function InvitationPage() {
    const params = useParams();
    const router = useRouter();
    const invitationId = params.id as string;
    
    const [invitation, setInvitation] = useState<IInvitation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [accepting, setAccepting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        loadInvitation();
    }, [invitationId]);

    const loadInvitation = async () => {
        try {
            try {
                const apiResponse = await fetch(`/api/invitation/${invitationId}`);
                const apiData = await apiResponse.json();
                
                
                if (apiResponse.ok && apiData) {
                    console.log('API success, setting invitation data');
                    setInvitation(apiData);
                    return;
                }
            } catch (apiError) {
            }
            
            const { data: invitationData, error: invitationError } = await supabase
                .from('organization_invitations')
                .select('id, organization_id, email, status, created_at')
                .eq('id', invitationId)
                .single();


            if (invitationError || !invitationData) {
                console.error('Failed to load invitation:', invitationError);
                setError('Invitation not found or invalid.');
                return;
            }

            if (invitationData.status !== 'pending') {
                if (invitationData.status === 'accepted') {
                    setError('This invitation has already been accepted.');
                } else if (invitationData.status === 'rejected') {
                    setError('This invitation has been declined.');
                } else {
                    setError('This invitation is no longer valid.');
                }
                return;
            }

            const inviteDate = new Date(invitationData.created_at);
            const expiryDate = new Date(inviteDate.getTime() + 7 * 24 * 60 * 60 * 1000);
            
            if (new Date() > expiryDate) {
                console.log('Invitation has expired');
                setError('This invitation has expired.');
                return;
            }

            // Get organization details
            const { data: organizationData, error: orgError } = await supabase
                .from('organizations')
                .select('id, title')
                .eq('id', invitationData.organization_id)
                .single();


            if (orgError || !organizationData) {
                console.error('Error loading organization:', orgError);
                setError('Organization not found.');
                return;
            }

            // Combine the data
            const combinedInvitation = {
                ...invitationData,
                organizations: {
                    title: organizationData.title
                }
            };

            setInvitation(combinedInvitation);

        } catch (err) {
            console.error('Error loading invitation:', err);
            setError('Failed to load invitation.');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptInvitation = async () => {
        if (!session?.user || !invitation) {
            setError('You must be logged in to accept invitations.');
            return;
        }

        if (session.user.email !== invitation.email) {
            setError(`This invitation was sent to ${invitation.email}. Please sign in with that email address.`);
            return;
        }

        setAccepting(true);

        try {
            // Check if user is already in another organization
            const { data: currentUser } = await supabase
                .from('users')
                .select('organization')
                .eq('id', session.user.id)
                .single();

            if (currentUser?.organization) {
                setError('You are already a member of another organization. Please leave your current organization first.');
                setAccepting(false);
                return;
            }

            // Update user's organization
            const { error: userError } = await supabase
                .from('users')
                .update({ organization: invitation.organization_id })
                .eq('id', session.user.id);

            if (userError) {
                setError('Failed to join organization.');
                setAccepting(false);
                return;
            }

            // Mark invitation as accepted
            const { error: inviteError } = await supabase
                .from('organization_invitations')
                .update({ status: 'accepted' })
                .eq('id', invitationId);

            if (inviteError) {
                console.error('Failed to update invitation status:', inviteError);
            }

            setSuccess(true);
            
            // Wait a moment then redirect to organization page
            setTimeout(() => {
                router.push('/organization?joined=true');
            }, 2000);

        } catch (err) {
            console.error('Error accepting invitation:', err);
            setError('An unexpected error occurred.');
        } finally {
            setAccepting(false);
        }
    };

    const handleDeclineInvitation = async () => {
        if (!invitation) return;

        try {
            await supabase
                .from('organization_invitations')
                .update({ status: 'rejected' })
                .eq('id', invitationId);
            
            setError('Invitation declined. You can close this page.');
        } catch (err) {
            setError('Failed to decline invitation.');
        }
    };

    if (loading) {
        return (
            <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
                <CircularProgress size={50} />
                <Typography sx={{ mt: 2 }} variant="h6">Loading invitation...</Typography>
            </Container>
        );
    }

    if (success) {
        return (
            <Container maxWidth="sm" sx={{ mt: 8 }}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                    <Typography variant="h4" gutterBottom color="success.main">
                        Welcome to {invitation?.organizations?.title || 'the organization'}!
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                        You have successfully joined the organization. Redirecting to dashboard...
                    </Typography>
                    <CircularProgress size={30} />
                </Paper>
            </Container>
        );
    }

    if (error || !invitation) {
        return (
            <Container maxWidth="sm" sx={{ mt: 8 }}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Error sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
                    <Typography variant="h5" color="error" gutterBottom>
                        Invalid Invitation
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                        {error || 'This invitation is not valid.'}
                    </Typography>
                    <Button variant="outlined" onClick={() => router.push('/')}>
                        Go Home
                    </Button>
                </Paper>
            </Container>
        );
    }

    if (!session?.user) {
        return (
            <Container maxWidth="sm" sx={{ mt: 8 }}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Group sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h5" gutterBottom>
                        Sign In Required
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                        You need to sign in to accept this invitation to join <strong>{invitation?.organizations?.title || 'this organization'}</strong>.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button variant="contained" onClick={() => router.push('/login')}>
                            Sign In
                        </Button>
                        <Button variant="outlined" onClick={() => router.push('/register')}>
                            Create Account
                        </Button>
                    </Box>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper sx={{ p: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Group sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h4" gutterBottom>
                        Organization Invitation
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        You've been invited to join
                    </Typography>
                    <Typography variant="h5" color="primary" sx={{ mt: 1, fontWeight: 600 }}>
                        {invitation?.organizations?.title || 'Unknown Organization'}
                    </Typography>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Alert severity="info" sx={{ mb: 3 }}>
                    <strong>Invitation Details:</strong>
                    <br />
                    • Sent to: <strong>{invitation.email}</strong>
                    <br />
                    • Date: {new Date(invitation.created_at).toLocaleDateString()}
                    <br />
                    • Organization: <strong>{invitation.organizations?.title || 'Unknown Organization'}</strong>
                </Alert>

                {session.user.email !== invitation.email && (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        <strong>Email Mismatch:</strong> This invitation was sent to {invitation.email}, 
                        but you're signed in as {session.user.email}. Please sign in with the correct email address.
                    </Alert>
                )}

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAcceptInvitation}
                        disabled={accepting || session.user.email !== invitation.email}
                        sx={{ minWidth: 120, py: 1.5 }}
                        startIcon={accepting ? <CircularProgress size={20} /> : <CheckCircle />}
                    >
                        {accepting ? 'Joining...' : 'Accept & Join'}
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleDeclineInvitation}
                        disabled={accepting}
                        sx={{ minWidth: 120, py: 1.5 }}
                    >
                        Decline
                    </Button>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 3 }}>
                    By accepting this invitation, you'll become a member of {invitation.organizations?.title || 'this organization'} 
                    and gain access to organization resources and features.
                </Typography>
            </Paper>
        </Container>
    );
}