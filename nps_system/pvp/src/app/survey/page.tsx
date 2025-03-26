"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Container, 
  List,
  Pagination,
  Drawer,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  IconButton
} from '@mui/material';
import { 
  Add as AddIcon, 
  QuestionAnswer as QuestionAnswerIcon,
  BarChart as BarChartIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon
} from '@mui/icons-material';
import FormDrawer from '@/components/FormDrawer';

interface SurveyItem {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  user_id: string;
  category?: string;
  distance?: number;
  hasWarning?: boolean;
  createdAt?: string;
  positiveVotes?: number;
  negativeVotes?: number;
}

export default function SurveysPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [surveyItems, setSurveyItems] = useState<SurveyItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Fetch data on component mount and when page changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // const response = await fetch(`/api/survey?page=${page}`);
        // const data = await response.json();
        const surveyItems: SurveyItem[] = [
          {
            id: '1',
            title: 'Survey 1',
            description: 'Description of Survey 1',
            status: 'active',
            created_at: '2022-01-01',
            user_id: '1',
            category: 'Category 1',
            distance: 10,
            hasWarning: false,
            positiveVotes: 10,
            negativeVotes: 5
          },
          {
            id: '2',
            title: 'Survey 2',
            description: 'Description of Survey 2',
            status: 'inactive',
            created_at: '2022-01-02',
            user_id: '2',
            category: 'Category 2',
            distance: 20,
            hasWarning: true,
            positiveVotes: 15,
            negativeVotes: 3
          }
        ]
        setSurveyItems(surveyItems);
        // setTotalPages(data.totalPages);
      } catch (error) {
        console.error('Error fetching survey items:', error);
        setSurveyItems([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [page]);
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSurveyClick = (surveyId: string) => {
    console.log('Clicked survey ID:', surveyId);
    // Uncomment below to navigate to survey detail page
    // router.push(`/surveys/${surveyId}`);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 60,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 60,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 2,
            bgcolor: '#f8f8f8'
          },
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6">LOGO</Typography>
        </Box>
        <List>
          <ListItemButton sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <ListItemIcon sx={{ minWidth: 'auto' }}>
              <QuestionAnswerIcon />
            </ListItemIcon>
          </ListItemButton>
          <ListItemButton sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <ListItemIcon sx={{ minWidth: 'auto' }}>
              <BarChartIcon />
            </ListItemIcon>
          </ListItemButton>
          <ListItemButton sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <ListItemIcon sx={{ minWidth: 'auto' }}>
              <PersonIcon />
            </ListItemIcon>
          </ListItemButton>
        </List>
      </Drawer>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                Hello Vardas!
              </Typography>
              <Typography variant="h5" color="text.secondary">
                Manage your surveys and forms
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              sx={{ 
                borderRadius: 28, 
                bgcolor: '#6c5ce7', 
                '&:hover': { bgcolor: '#5649c9' }
              }}
              onClick={() => setIsDrawerOpen(true)}
            >
              Add form
            </Button>
          </Box>
          <FormDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <Button 
              variant="contained" 
              startIcon={<BarChartIcon />} 
              sx={{ 
                borderRadius: 28, 
                bgcolor: '#a29bfe', 
                '&:hover': { bgcolor: '#8c7ae6' }
              }}
            >
              Rate
            </Button>
            <Button 
              variant="contained" 
              startIcon={<BarChartIcon />} 
              sx={{ 
                borderRadius: 28, 
                bgcolor: '#a29bfe', 
                '&:hover': { bgcolor: '#8c7ae6' }
              }}
            >
              Positive feedback
            </Button>
            <Button 
              variant="outlined" 
              sx={{ 
                borderRadius: 28, 
                color: '#6c5ce7', 
                borderColor: '#6c5ce7', 
                '&:hover': { borderColor: '#5649c9' }
              }}
            >
              Negative feedback
            </Button>
          </Box>

          {/* Survey Items List */}
          {loading ? (
            <Typography>Loading...</Typography>
          ) : (
            <List sx={{ bgcolor: 'background.paper' }}>
              {surveyItems.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body1">No surveys found</Typography>
                </Paper>
              ) : (
                surveyItems.map((item) => (
                  <Paper 
                    key={item.id} 
                    elevation={0} 
                    sx={{ 
                      mb: 1, 
                      p: 2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      border: '1px solid #eee',
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                    onClick={() => handleSurveyClick(item.id)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: '#eee', color: '#666', mr: 2 }}>
                        <BarChartIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                          {item.title}
                          {item.hasWarning && (
                            <WarningIcon sx={{ ml: 1, color: 'orange', fontSize: 20 }} />
                          )}
                          <Chip 
                            label={item.status} 
                            size="small" 
                            sx={{ 
                              ml: 1, 
                              bgcolor: item.status === 'active' ? '#a0e57c' : '#f0f0f0',
                              color: item.status === 'active' ? '#326015' : '#666'
                            }} 
                          />
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {item.category && (
                            <Typography variant="caption" color="text.secondary">
                              Category: {item.category}
                            </Typography>
                          )}
                          {item.distance && (
                            <Typography variant="caption" color="text.secondary">
                              • {item.distance} miles away
                            </Typography>
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {item.description}
                        </Typography>
                      </Box>
                    </Box>
                    <Box 
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>{item.positiveVotes}</Typography>
                        <IconButton 
                          size="small" 
                          color="inherit"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Upvote:', item.id);
                          }}
                        >
                          <KeyboardArrowUpIcon />
                        </IconButton>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>{item.negativeVotes}</Typography>
                        <IconButton 
                          size="small" 
                          color="inherit"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Downvote:', item.id);
                          }}
                        >
                          <KeyboardArrowDownIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Paper>
                ))
              )}
            </List>
          )}

          {/* Pagination */}
          {surveyItems.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
                sx={{
                  '& .MuiPaginationItem-root': {
                    '&.Mui-selected': {
                      bgcolor: '#a29bfe',
                    }
                  }
                }}
              />
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
}