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
import { useRouter, usePathname } from 'next/navigation';
import TopBar from '../TopBar';
import GroupsIcon from '@mui/icons-material/Groups';

export default function SurveyHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: 'Questions', icon: <QuestionAnswerIcon />, path: '/survey' },
    { label: 'Statistics', icon: <BarChartIcon />, path: '/statistics' },
    { label: 'Profile', icon: <PersonIcon />, path: '/profile' },
    { label: 'Organization', icon: <GroupsIcon />, path: '/organization' }
  ];

  return (
      <>
        <TopBar />
          <Drawer
              variant="permanent"
              sx={{
                  width: 100,
                  flexShrink: 0,
                  '& .MuiDrawer-paper': {
                      width: 100,
                      boxSizing: 'border-box',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      py: 2,
                      bgcolor: '#f8f8f8',
                  },
              }}
          >
              <Box sx={{ mb: 4 }}>
                  <img
                      src="/logo.svg"
                      alt="NPS Systems Logo"
                      style={{
                          width: "80px",      // Tik vienas matmuo
                          objectFit: "contain"
                      }}
                  />

              </Box>

              <List>
                  {navItems.map((item) => {
                      const isActive = pathname.startsWith(item.path);
              return (
                  <ListItemButton
                      key={item.label}
                      onClick={() => router.push(item.path)}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 2,
                        bgcolor: isActive ? '#d1c4e9' : 'transparent',
                        borderRadius: 2,
                        width: '80%',
                        mx: 'auto',
                        transition: 'background-color 0.3s'
                      }}
                  >
                    <ListItemIcon sx={{ minWidth: 'auto', color: isActive ? '#4527a0' : 'inherit' }}>
                      {item.icon}
                    </ListItemIcon>
                    <Typography
                        variant="caption"
                        sx={{
                          mt: 1,
                          fontWeight: isActive ? 'bold' : 'normal',
                          color: isActive ? '#4527a0' : 'inherit'
                        }}
                    >
                      {item.label}
                    </Typography>
                  </ListItemButton>
              );
            })}
          </List>
        </Drawer>
      </>
  );
}
