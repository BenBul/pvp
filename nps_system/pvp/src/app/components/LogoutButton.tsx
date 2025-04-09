'use client';

import { Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import {logout, session} from '@/supabase/client';

export default function LogoutButton() {
    if (!session) return null;
    return (
        <Button
            onClick={logout}
            startIcon={<LogoutIcon />}
            color="error"
            variant="outlined"
            sx={{
                mt: 'auto',
                mb: 2,
                width: '80%',
                justifyContent: 'flex-start',
                textTransform: 'none',
                pl: 1,
            }}
        >
            Logout
        </Button>
    );
}