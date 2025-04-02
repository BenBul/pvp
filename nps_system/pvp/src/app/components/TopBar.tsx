'use client';

import { AppBar, Toolbar, IconButton } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { logout, session } from '@/supabase/client';

export default function TopBar() {
    if (!session) return null;

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                bgcolor: '#F8F0FB',
                borderBottom: '1px solid #ddd',
                color: 'black'
            }}
        >
            <Toolbar sx={{ justifyContent: 'flex-end', minHeight: '69px !important' }}>
                <IconButton
                    onClick={logout}
                    color="secondary"
                    sx={{
                        bgcolor: '#6c5ce7',
                        color: 'white',
                        '&:hover': { bgcolor: '#5a4ad0' }
                    }}
                >
                    <LogoutIcon />
                </IconButton>
            </Toolbar>
        </AppBar>

    );
}
