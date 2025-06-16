'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    TextField, Container, Typography, Box, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, List, ListItem, ListItemText, ListItemSecondaryAction,
    IconButton, Chip, Alert, Snackbar, Tabs, Tab, Select, MenuItem, FormControl,
    InputLabel, SelectChangeEvent, CircularProgress
} from '@mui/material';
import { Delete as DeleteIcon, PersonAdd as PersonAddIcon, Lock as LockIcon, Edit as EditIcon } from '@mui/icons-material';
import { session, supabase } from '@/supabase/client';

interface IOrganization {
    id: string;
    title: string;
    logo?: string;
    created_at?: string;
    owner_id?: string;
}

interface IUser {
    id: string;
    email: string;
    full_name?: string;
    role?: 'viewer' | 'editor';
}

interface IInvitation {
    id: string;
    email: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
}

const OrganizationPageContent = () => {
    const searchParams = useSearchParams();
    const justJoined = searchParams?.get('joined') === 'true';
    const [organizationName, setOrganizationName] = useState('');
    const [organizationNameError, setOrganizationNameError] = useState('');
    const [organizationId, setOrganizationId] = useState<string | null>(null);
    const [createOrgOpen, setCreateOrgOpen] = useState(false);
    const [newOrgName, setNewOrgName] = useState('');
    const [newOrgNameError, setNewOrgNameError] = useState('');

    // User management states
    const [organizationUsers, setOrganizationUsers] = useState<IUser[]>([]);
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteEmailError, setInviteEmailError] = useState('');
    const [pendingInvitations, setPendingInvitations] = useState<IInvitation[]>([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [activeTab, setActiveTab] = useState(0);
    const [isOwner, setIsOwner] = useState(false);
    const [loading, setLoading] = useState(false);

    // Role editing states
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editingUserRole, setEditingUserRole] = useState<'viewer' | 'editor'>('viewer');

    useEffect(() => {
        const loadData = async () => {
            if (!session?.user?.id) return;

            // First get user data to find their organization ID
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('organization')
                .eq('id', session.user.id)
                .single();

            if (userError || !userData?.organization) {
                return;
            }

            // Then get organization details
            const { data: orgData, error: orgError } = await supabase
                .from('organizations')
                .select('id, title, owner_id')
                .eq('id', userData.organization)
                .single();

            if (!orgError && orgData) {
                setOrganizationId(orgData.id);
                setOrganizationName(orgData.title);
                const userIsOwner = orgData.owner_id === session.user.id;
                setIsOwner(userIsOwner);

                // Load users and invitations if user is owner
                if (userIsOwner) {
                    loadOrganizationUsers(orgData.id);
                    loadPendingInvitations(orgData.id);
                }

                // Show welcome message if user just joined
                if (justJoined) {
                    showSnackbar(`Welcome to ${orgData.title}! You have successfully joined the organization.`, 'success');
                }
            }
        };

        loadData();

        // Set up real-time subscription for user changes (only if owner)
        let channel: any;
        if (isOwner && organizationId) {
            channel = supabase
                .channel('organization-users')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'users'
                    },
                    (payload) => {
                        if (organizationId) {
                            loadOrganizationUsers(organizationId);
                        }
                    }
                )
                .subscribe();
        }

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [session?.user?.id, organizationId, justJoined, isOwner]);

    const loadOrganizationUsers = async (orgId: string) => {
        const { data, error } = await supabase
            .from('users')
            .select('id, name, role, created_at')
            .eq('organization', orgId);

        if (!error && data) {
            setOrganizationUsers(data.map(user => ({
                id: user.id,
                email: user.name || 'No name available',
                full_name: user.name,
                role: user.role || 'viewer'
            })));
        } else {
            console.log('Error loading organization users:', error);
            setOrganizationUsers([]);
        }
    };

    const loadPendingInvitations = async (orgId: string) => {
        try {
            const { data, error } = await supabase
                .from('organization_invitations')
                .select('id, email, status, created_at')
                .eq('organization_id', orgId)
                .eq('status', 'pending');

            if (!error) {
                setPendingInvitations(data || []);
            }
        } catch (e) {
            setPendingInvitations([]);
        }
    };

    const validateOrganizationName = (orgName: string): string => {
        if (orgName.length > 30) return 'Organization name must be less than 30 characters long.';
        if (!orgName.trim()) return 'Organization name is required.';
        return '';
    };

    const validateEmail = (email: string): string => {
        if (!email.trim()) return 'Email is required.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return 'Please enter a valid email address.';
        return '';
    };

    const canManageUsers = () => {
        return isOwner;
    };

    const saveOrganizationName = async () => {
        if (!isOwner) return;

        const error = validateOrganizationName(organizationName);
        if (error) {
            setOrganizationNameError(error);
            return;
        }
        setOrganizationNameError('');

        const { error: updateError } = await supabase
            .from('organizations')
            .update({ title: organizationName })
            .eq('id', organizationId);

        if (updateError) {
            showSnackbar('Failed to update organization name', 'error');
        } else {
            showSnackbar('Organization name updated successfully', 'success');
        }
    };

    const handleCreateOrg = async () => {
        const id = crypto.randomUUID();
        const error = validateOrganizationName(newOrgName);
        if (error) {
            setNewOrgNameError(error);
            return;
        }
        setNewOrgNameError('');

        const { error: orgError } = await supabase
            .from('organizations')
            .insert({
                title: newOrgName,
                id,
                owner_id: session?.user.id
            });

        if (orgError) {
            setNewOrgNameError('Failed to create organization.');
            return;
        }

        // const { error: userError } = await supabase
        //     .from('users')
        //     .update({ organization: id })
        //     .eq('id', session?.user.id);

        // if (userError) {
        //     setNewOrgNameError('Failed to assign organization.');
        //     return;
        // }

        setOrganizationId(id);
        setOrganizationName(newOrgName);
        setIsOwner(true);
        setCreateOrgOpen(false);
        setNewOrgName('');
        showSnackbar('Organization created successfully', 'success');
    };

    const handleInviteUser = async () => {
        if (!isOwner) return;

        const emailError = validateEmail(inviteEmail);
        if (emailError) {
            setInviteEmailError(emailError);
            return;
        }

        // Check if invitation already exists
        const existingInvitation = pendingInvitations.find(inv => inv.email === inviteEmail);
        if (existingInvitation) {
            setInviteEmailError('An invitation has already been sent to this email.');
            return;
        }

        setInviteEmailError('');
        setLoading(true);

        try {
            // Step 1: Create invitation record in database (client-side)
            const invitationId = crypto.randomUUID();
            const { error: inviteError } = await supabase
                .from('organization_invitations')
                .insert({
                    id: invitationId,
                    organization_id: organizationId,
                    email: inviteEmail,
                    invited_by: session?.user.id,
                    status: 'pending'
                });

            if (inviteError) {
                console.error('Database error:', inviteError);
                throw new Error('Failed to create invitation record');
            }

            // Step 2: Send invitation email using simplified API
            const response = await fetch("/api/send-invitation", {
                method: "POST",
                body: JSON.stringify({
                    email: inviteEmail,
                    organizationName: organizationName,
                    invitationId: invitationId
                }),
                headers: { "Content-Type": "application/json" },
            });

            const result = await response.json();

            if (response.ok) {
                showSnackbar('Invitation sent successfully', 'success');
                setInviteDialogOpen(false);
                setInviteEmail('');
                loadPendingInvitations(organizationId!);
            } else {
                // Step 3: If email fails, clean up the invitation record
                await supabase
                    .from('organization_invitations')
                    .delete()
                    .eq('id', invitationId);

                throw new Error(result.error || 'Failed to send invitation email');
            }
        } catch (error) {
            console.error('Invitation error:', error);
            showSnackbar(
                error instanceof Error ? error.message : 'Failed to send invitation',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleEditUserRole = async (userId: string, newRole: 'viewer' | 'editor') => {
        if (!isOwner) {
            showSnackbar('You do not have permission to change user roles', 'error');
            return;
        }

        const { error } = await supabase
            .rpc("update_user_role", {target_user_id: userId, new_role: newRole});

        if (error) {
            showSnackbar('Failed to update user role', 'error');
        } else {
            showSnackbar('User role updated successfully', 'success');
            setEditingUserId(null);
            loadOrganizationUsers(organizationId!);
        }
    };

    const handleRemoveUser = async (userId: string, userEmail: string) => {
        if (!isOwner) return;

        if (userId === session?.user.id) {
            showSnackbar('You cannot remove yourself from the organization', 'error');
            return;
        }

        if (confirm(`Are you sure you want to remove ${userEmail} from the organization?`)) {
            const { error } = await supabase
                .rpc("remove_user_from_organization", {target_user_id: userId});

            if (error) {
                showSnackbar('Failed to remove user', 'error');
            } else {
                showSnackbar('User removed successfully', 'success');
                loadOrganizationUsers(organizationId!);
            }
        }
    };

    const handleCancelInvitation = async (invitationId: string) => {
        if (!isOwner) return;

        const { error } = await supabase
            .from('organization_invitations')
            .delete()
            .eq('id', invitationId);

        if (error) {
            showSnackbar('Failed to cancel invitation', 'error');
        } else {
            showSnackbar('Invitation cancelled', 'success');
            loadPendingInvitations(organizationId!);
        }
    };

    const getRoleColor = (role: 'viewer' | 'editor') => {
        switch (role) {
            case 'viewer': return 'default';
            case 'editor': return 'primary';
            default: return 'default';
        }
    };

    const getRoleDescription = (role: 'viewer' | 'editor') => {
        switch (role) {
            case 'viewer': return 'Can view content but cannot make changes';
            case 'editor': return 'Can view and edit content';
            default: return '';
        }
    };

    const showSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <Container maxWidth="md" sx={{ marginTop: '5%', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Organization Management
                </Typography>
                <Typography variant="h6" color="text.primary">
                    {isOwner ? 'Create or manage your organization and team members.' : 'View your organization details.'}
                </Typography>
            </Box>

            {organizationId ? (
                <Box>
                    <TextField
                        label="Organization Name"
                        variant="outlined"
                        fullWidth
                        value={organizationName}
                        error={!!organizationNameError}
                        helperText={organizationNameError}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        onBlur={saveOrganizationName}
                        disabled={!isOwner}
                        sx={{
                            borderRadius: 28,
                            bgcolor: '#f5f5f5',
                            '&:hover': { bgcolor: '#f0f0f0' },
                            mb: 3
                        }}
                    />

                    {isOwner ? (
                        <>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                                    <Tab label={`Members (${organizationUsers.length})`} />
                                    <Tab label={`Pending Invitations (${pendingInvitations.length})`} />
                                </Tabs>
                            </Box>

                            {activeTab === 0 && (
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6">Team Members</Typography>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => organizationId && loadOrganizationUsers(organizationId)}
                                            >
                                                Refresh
                                            </Button>
                                            <Button
                                                variant="contained"
                                                startIcon={<PersonAddIcon />}
                                                onClick={() => setInviteDialogOpen(true)}
                                                disabled={loading}
                                            >
                                                Invite User
                                            </Button>
                                        </Box>
                                    </Box>

                                    <List>
                                        {organizationUsers.map((user) => (
                                            <ListItem key={user.id} divider>
                                                <ListItemText
                                                    primary={user.full_name || user.email}
                                                    secondary={`ID: ${user.id.substring(0, 8)}...`}
                                                />
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
                                                    {user.id === session?.user.id && (
                                                        <Chip label="You" size="small" color="primary" />
                                                    )}
                                                    {isOwner && user.id === session?.user.id && (
                                                        <Chip label="Owner" size="small" color="secondary" />
                                                    )}
                                                    
                                                    {editingUserId === user.id ? (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <FormControl size="small" sx={{ minWidth: 100 }}>
                                                                <Select
                                                                    value={editingUserRole}
                                                                    onChange={(e) => setEditingUserRole(e.target.value as 'viewer' | 'editor')}
                                                                >
                                                                    <MenuItem value="viewer">Viewer</MenuItem>
                                                                    <MenuItem value="editor">Editor</MenuItem>
                                                                </Select>
                                                            </FormControl>
                                                            <Button
                                                                size="small"
                                                                onClick={() => handleEditUserRole(user.id, editingUserRole)}
                                                            >
                                                                Save
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                onClick={() => setEditingUserId(null)}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </Box>
                                                    ) : (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Chip 
                                                                label={user.role || 'viewer'} 
                                                                size="small" 
                                                                color={getRoleColor(user.role || 'viewer')} 
                                                            />
                                                            {isOwner && user.id !== session?.user.id && (
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => {
                                                                        setEditingUserId(user.id);
                                                                        setEditingUserRole(user.role || 'viewer');
                                                                    }}
                                                                >
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                            )}
                                                        </Box>
                                                    )}
                                                </Box>
                                                {user.id !== session?.user.id && isOwner && (
                                                    <ListItemSecondaryAction>
                                                        <IconButton
                                                            edge="end"
                                                            color="error"
                                                            onClick={() => handleRemoveUser(user.id, user.full_name || user.id)}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </ListItemSecondaryAction>
                                                )}
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            )}

                            {activeTab === 1 && (
                                <Box>
                                    <Typography variant="h6" sx={{ mb: 2 }}>Pending Invitations</Typography>
                                    {pendingInvitations.length === 0 ? (
                                        <Typography color="text.secondary">No pending invitations</Typography>
                                    ) : (
                                        <List>
                                            {pendingInvitations.map((invitation) => (
                                                <ListItem key={invitation.id} divider>
                                                    <ListItemText
                                                        primary={invitation.email}
                                                        secondary={`Invited on ${new Date(invitation.created_at).toLocaleDateString()}`}
                                                    />
                                                    <ListItemSecondaryAction>
                                                        <Button
                                                            color="error"
                                                            onClick={() => handleCancelInvitation(invitation.id)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </ListItemSecondaryAction>
                                                </ListItem>
                                            ))}
                                        </List>
                                    )}
                                </Box>
                            )}
                        </>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <LockIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h5" color="text.secondary" gutterBottom>
                                Access Restricted
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                                You don't have permission to view team members and manage invitations. 
                                Only organization owners can access this information.
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                You are currently a member of <strong>{organizationName}</strong>
                            </Typography>
                        </Box>
                    )}
                </Box>
            ) : (
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ mb: 3 }} color="text.secondary">
                        You are not part of any organization yet.
                    </Typography>
                    <Button variant="contained" size="large" onClick={() => setCreateOrgOpen(true)}>
                        Create Organization
                    </Button>
                </Box>
            )}

            {/* Create Organization Dialog */}
            <Dialog open={createOrgOpen} onClose={() => setCreateOrgOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create Organization</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Organization Name"
                        fullWidth
                        value={newOrgName}
                        error={!!newOrgNameError}
                        helperText={newOrgNameError}
                        onChange={(e) => setNewOrgName(e.target.value)}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateOrgOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateOrg}>Create</Button>
                </DialogActions>
            </Dialog>

            {/* Invite User Dialog */}
            <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Invite User to Organization</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        An invitation email will be sent to the user with a link to join your organization.
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Email Address"
                        type="email"
                        fullWidth
                        value={inviteEmail}
                        error={!!inviteEmailError}
                        helperText={inviteEmailError}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        disabled={loading}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setInviteDialogOpen(false)} disabled={loading}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleInviteUser}
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Invitation'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

const OrganizationPage = () => {
    return (
        <Suspense fallback={
            <Container maxWidth="md" sx={{ marginTop: '5%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress />
            </Container>
        }>
            <OrganizationPageContent />
        </Suspense>
    );
};

export default OrganizationPage;