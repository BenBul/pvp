"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Container,
  Pagination,
  TextField,
  InputAdornment,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import FormDrawer from '@/app/components/dashboard/surveys/FormDrawer';
import SurveyItemsList from '@/app/components/dashboard/surveys/SurveyItemList';
import TopBar from '../components/TopBar';
import { supabase, getCachedName, getUserName } from '@/supabase/client';
import { exportAllSurveysToCsv } from '@/utils/exportUtils';

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
  const [filteredItems, setFilteredItems] = useState<SurveyItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { count: totalItems } = await supabase
            .from('surveys')
            .select('*', { count: 'exact' });

        const { data: rawSurveyItems } = await supabase
            .from('surveys')
            .select('*')
            .order('created_at', { ascending: false })
            .range(from, to);

        const { data: answersData } = await supabase
            .from('answers')
            .select(`
            ispositive,
            question_id,
            questions:question_id (
              survey_id
            )
          `);

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
            distance: Math.floor(Math.random() * 50),
          };
        });

        setSurveyItems(surveyItems);
        setFilteredItems(surveyItems);
        setDisplayName(getCachedName() || await getUserName());
        setTotalPages(Math.ceil((totalItems || 0) / pageSize));
      } catch (error) {
        console.error('Error fetching survey items or answers:', error);
        setSurveyItems([]);
        setFilteredItems([]);
      } finally {
        setLoading(false);
        setRefresh(false);
      }
    };

    fetchData();
  }, [page, refresh]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredItems(surveyItems);
    } else {
      const filtered = surveyItems.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, surveyItems]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSurveyClick = (surveyId: string) => {
    router.push(`/survey/${surveyId}`);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleExportAllSurveys = async () => {
    setExportLoading(true);
    try {
      await exportAllSurveysToCsv();
    } catch (error) {
      console.error("Error exporting all surveys:", error);
    } finally {
      setExportLoading(false);
    }
  };

  return (
      <>
        <TopBar />
        <Box sx={{ display: 'flex', mt: 8 }}>
          <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    Hello {displayName}!
                  </Typography>
                  <Typography variant="h5" color="text.secondary">
                    Manage your surveys and forms
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Tooltip title="Export all surveys to CSV">
                    <Button
                        variant="outlined"
                        startIcon={exportLoading ? <CircularProgress size={20} /> : <FileDownloadIcon />}
                        onClick={handleExportAllSurveys}
                        disabled={exportLoading || loading}
                        sx={{ borderRadius: 28, bgcolor: 'transparent' }}
                    >
                      Export CSV
                    </Button>
                  </Tooltip>
                  <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      sx={{ borderRadius: 28, bgcolor: 'main' }}
                      onClick={() => setIsDrawerOpen(true)}
                  >
                    Add form
                  </Button>
                </Box>
              </Box>

              <FormDrawer
                  isOpen={isDrawerOpen}
                  onClose={() => setIsDrawerOpen(false)}
                  refreshItems={() => setRefresh(true)}
              />

              <Box sx={{ mb: 6, mt: 9, width: '100%' }}>
                <TextField
                  fullWidth
                  placeholder="Search surveys by title..."
                  variant="outlined"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    sx: { 
                      borderRadius: 28,
                      bgcolor: '#f5f5f5',
                      '&:hover': {
                        bgcolor: '#f0f0f0'
                      }
                    }
                  }}
                />
              </Box>

              <SurveyItemsList 
                items={filteredItems} 
                loading={loading} 
                onSurveyClick={handleSurveyClick} 
              />

              {filteredItems.length > 0 && (
                  <Box sx={{ mt: 4, width: '100%', display: 'flex', justifyContent: 'center', bgcolor: '#f5f0ff', py: 3 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        sx={{
                          '& .MuiPaginationItem-root': {
                            '&.Mui-selected': {
                              bgcolor: '#a29bfe'
                            }
                          }
                        }}
                    />
                  </Box>
              )}
            </Container>
          </Box>
        </Box>
      </>
  );
}