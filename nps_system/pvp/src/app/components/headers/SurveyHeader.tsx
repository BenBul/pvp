'use client';

import React from 'react';
import {
  Typography,
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
} from '@mui/material';
import { 
    QuestionAnswer as QuestionAnswerIcon,
    BarChart as BarChartIcon,
    Person as PersonIcon
  } from '@mui/icons-material';

export default function SurveyHeader() {
  return (
    <Drawer
            variant="permanent"
            sx={{
              width: 60,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: 100,
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: 2,
                bgcolor: '#f8f8f8'
              },
            }}
          >
            <Box sx={{ mb: 4, justifyContent: 'center' }}>
              <Typography variant="h6">LOGO</Typography>
            </Box>
            <List>
              <ListItemButton sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <ListItemIcon sx={{ minWidth: 'auto' }}>
                  <QuestionAnswerIcon />
                </ListItemIcon>
                <Typography variant="caption" sx={{ mt: 1 }}>
                  Questions
                </Typography>
              </ListItemButton>
              <ListItemButton sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <ListItemIcon sx={{ minWidth: 'auto' }}>
                  <BarChartIcon />
                </ListItemIcon>
                <Typography variant="caption" sx={{ mt: 1 }}>
                  Statistics
                </Typography>
              </ListItemButton>
              <ListItemButton sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <ListItemIcon sx={{ minWidth: 'auto' }}>
                  <PersonIcon />
                </ListItemIcon>
                <Typography variant="caption" sx={{ mt: 1 }}>
                  Profile
                </Typography>
              </ListItemButton>
            </List>
          </Drawer>
  );
}