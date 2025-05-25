'use client';
import React, { useState, useEffect } from 'react';
import {
    TextField, Container, Typography, Box, Button, Dialog, DialogTitle,
    DialogContent, DialogActions
} from '@mui/material';
import { session, supabase } from '@/supabase/client';

interface IOrganization {
    id: string;
    title: string;
    logo?: string;
    created_at?: string;
}

const OrganizationPage = () => {
    const [organizationName, setOrganizationName] = useState('');
    const [organizationNameError, setOrganizationNameError] = useState('');
    const [organizationId, setOrganizationId] = useState<string | null>(null);
    const [createOrgOpen, setCreateOrgOpen] = useState(false);
    const [newOrgName, setNewOrgName] = useState('');
    const [newOrgNameError, setNewOrgNameError] = useState('');

    useEffect(() => {
        const loadData = async () => {
            const { data, error } = await supabase
                .from('users')
                .select('organizations(id, title)')
                .eq('id', session?.user.id)
                .maybeSingle<{ organizations: IOrganization }>();
            if (!error) {
                setOrganizationId(data?.organizations?.id ?? null);
                setOrganizationName(data?.organizations?.title ?? '');
            }
        };
        loadData();
    }, []);

    const validateOrganizationName = (orgName: string): string => {
        if (orgName.length > 30) return 'Organization name must be less than 30 characters long.';
        if (!orgName.trim()) return 'Organization name is required.';
        return '';
    };

    const saveOrganizationName = async () => {
        const error = validateOrganizationName(organizationName);
        if (error) {
            setOrganizationNameError(error);
            return;
        }
        setOrganizationNameError('');
        await supabase
            .from('organizations')
            .update({ title: organizationName })
            .eq('id', organizationId);
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
            .insert({ title: newOrgName, id });
        if (orgError) {
            setNewOrgNameError('Failed to create organization.');
            return;
        }
        const { error: userError } = await supabase
            .from('users')
            .update({ organization: id })
            .eq('id', session?.user.id);
        if (userError) {
            setNewOrgNameError('Failed to assign organization.');
            return;
        }
        setOrganizationId(id);
        setOrganizationName(newOrgName);
        setCreateOrgOpen(false);
        setNewOrgName('');
    };

    return (
        <Container maxWidth="sm" sx={{ marginTop: '5%', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Organization Management
                </Typography>
                <Typography variant="h6" color="text.primary">
                    Create or update your organization.
                </Typography>
            </Box>
            <Box>
                {organizationId ? (
                    <TextField
                        label="Organization Name"
                        variant="outlined"
                        fullWidth
                        value={organizationName}
                        error={!!organizationNameError}
                        helperText={organizationNameError}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        onBlur={saveOrganizationName}
                        sx={{
                            borderRadius: 28,
                            bgcolor: '#f5f5f5',
                            '&:hover': { bgcolor: '#f0f0f0' },
                        }}
                    />
                ) : (
                    <Box>
                        <Button variant="contained" onClick={() => setCreateOrgOpen(true)}>
                            Create Organization
                        </Button>
                    </Box>
                )}
            </Box>
            <Dialog open={createOrgOpen} onClose={() => setCreateOrgOpen(false)}>
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
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateOrgOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateOrg}>Create</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default OrganizationPage;