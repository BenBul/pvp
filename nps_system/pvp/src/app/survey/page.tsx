"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Container,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  Pagination
} from '@mui/material';
import {
  Add as AddIcon,
  QuestionAnswer as QuestionAnswerIcon,
  BarChart as BarChartIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import FormDrawer from '@/app/components/dashboard/surveys/FormDrawer';
import SurveyItemsList from '@/app/components/dashboard/surveys/SurveyItemList';
import { supabase } from '@/supabase/client';
import { session } from '@/supabase/client';

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
  const [refresh, setRefresh] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data: rawSurveyItems, error: surveysError, count: totalItems } = await supabase
            .from('surveys')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (surveysError) throw surveysError;

        const { data: answersData, error: answersError } = await supabase
            .from('answers')
            .select(`
            ispositive,
            question_id,
            questions:question_id (
              survey_id
            )
          `);

        if (answersError) throw answersError;

        const voteCounts: Record<string, { positive: number; negative: number }> = {};

        answersData?.forEach(answer => {
          const surveyId = (answer as any)?.questions?.survey_id;
          if (!surveyId) return;

          if (!voteCounts[surveyId]) {
            voteCounts[surveyId] = { positive: 0, negative: 0 };
          }

          if ((answer as any).ispositive) {
            voteCounts[surveyId].positive += 1;
          } else {
            voteCounts[surveyId].negative += 1;
          }
        });

        const surveyItems: SurveyItem[] = (rawSurveyItems || []).map(item => {
          const votes = voteCounts[item.id] || { positive: 0, negative: 0 };
          return {
            ...item,
            positiveVotes: votes.positive,
            negativeVotes: votes.negative,
            createdAt: item.created_at,
            hasWarning: Math.random() > 0.7,
            distance: Math.floor(Math.random() * 50)
          };
        });

        setSurveyItems(surveyItems);
        setTotalPages(Math.ceil((totalItems || 0) / pageSize));
      } catch (error) {
        setSurveyItems([]);
      } finally {
        setLoading(false);
        setRefresh(false);
      }
    };

    fetchData();
  }, [page, refresh]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };


  const handleSurveyClick = (surveyId: string) => {
    router.push(`/survey/${surveyId}`);
  };

  return (
      <Box sx={{ display: 'flex' }}>
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

        <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Container maxWidth="lg" sx={{ mt: 12, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  Hello {session?.user.email || ''}!
                </Typography>
                <Typography variant="h5" color="text.secondary">
                  Manage your surveys and forms
                </Typography>
              </Box>
              <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{ borderRadius: 28, bgcolor: 'main' }}
                  onClick={() => setIsDrawerOpen(true)}
              >
                Add form
              </Button>
            </Box>

            <FormDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} refreshItems={() => setRefresh(true)} />

            <Box sx={{ display: 'flex', gap: 2, mb: 6, mt: 9, justifyContent: 'center' }}>
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

            <SurveyItemsList
                items={surveyItems}
                loading={loading}
                onSurveyClick={handleSurveyClick}
            />

            {surveyItems.length > 0 && (
                <Box
                    sx={{
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      bgcolor: 'main',
                      py: 5,
                    }}
                >
                  <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      sx={{
                        '& .MuiPaginationItem-root': {
                          '&.Mui-selected': {
                            bgcolor: '#a29bfe',
                          },
                        },
                      }}
                  />
                </Box>
            )}
          </Container>
        </Box>
      </Box>
  );
}
