import { supabase } from '@/supabase/client';

type Answer = {
  id: string;
  created_at: string;
  question_id: string;
  ispositive: boolean;
  rating?: number;  
};

type Question = {
  id: string;
  created_at: string;
  survey_id: string;
  description: string;
  type: string;
  is_deleted: boolean;
};

type Survey = {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  user_id: string;
};


export const exportSurveyToCsv = async (surveyId: string, surveyTitle: string): Promise<boolean> => {
  try {
    const { data: surveyData, error: surveyError } = await supabase
      .from('surveys')
      .select('*')
      .eq('id', surveyId)
      .single();
    
    if (surveyError) throw surveyError;
    
    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .select(`
        *,
        entries (*)
      `)
      .eq('survey_id', surveyId)
      .eq('is_deleted', false);
    
    if (questionsError) throw questionsError;
    
    const questionIds = questionsData.map(q => q.id);
    const { data: answersData, error: answersError } = await supabase
      .from('answers')
      .select('*')
      .in('question_id', questionIds);
    
    if (answersError) throw answersError;
    
    let csvContent = "Question ID,Question,Question Type,Created Date,Positive Votes,Negative Votes,Total Votes,Average Rating\n";
    
    questionsData.forEach(question => {
      const questionAnswers = answersData.filter(a => a.question_id === question.id);
      const positiveVotes = questionAnswers.filter(a => a.ispositive).length;
      const negativeVotes = questionAnswers.filter(a => !a.ispositive).length;
      const totalVotes = positiveVotes + negativeVotes;
      const createdDate = new Date(question.created_at).toLocaleDateString();
      
      let avgRating = "";
      if (question.type === 'rating') {
        const ratingAnswers = questionAnswers.filter(a => a.rating !== undefined && a.rating !== null);
        if (ratingAnswers.length > 0) {
          const sumRatings = ratingAnswers.reduce((sum, answer) => sum + (answer.rating || 0), 0);
          avgRating = (sumRatings / ratingAnswers.length).toFixed(2);
        }
      }
      
      const escapedDescription = `"${question.description.replace(/"/g, '""')}"`;
      
      csvContent += `${question.id},${escapedDescription},${question.type},${createdDate},${positiveVotes},${negativeVotes},${totalVotes},${avgRating}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${surveyTitle.replace(/\s+/g, '_')}_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error("Error exporting survey:", error);
    return false;
  }
};


export const exportAllSurveysToCsv = async (): Promise<boolean> => {
  try {
    const { data: surveysData, error: surveysError } = await supabase
      .from('surveys')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (surveysError) throw surveysError;
    
    let csvContent = "Survey ID,Title,Description,Status,Created Date,Positive Votes,Negative Votes,Total Questions,Rating Questions Count,Rating Answers Count,Average Rating\n";
    
    for (const survey of surveysData) {
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('id, type')
        .eq('survey_id', survey.id)
        .eq('is_deleted', false);
      
      if (questionsError) throw questionsError;
      
      const questionCount = questionsData?.length || 0;
      const questionIds = questionsData?.map(q => q.id) || [];
      
      let positiveVotes = 0;
      let negativeVotes = 0;
      let avgRating = "";
      let ratingQuestionsCount = 0;
      let ratingAnswersCount = 0;
      
      if (questionIds.length > 0) {
        const { data: answersData, error: answersError } = await supabase
          .from('answers')
          .select('*')
          .in('question_id', questionIds);
        
        if (answersError) throw answersError;
        
        positiveVotes = answersData?.filter(a => a.ispositive).length || 0;
        negativeVotes = answersData?.filter(a => !a.ispositive).length || 0;
        
        const ratingQuestionIds = questionsData
          .filter(q => q.type === 'rating')
          .map(q => q.id);
        
        ratingQuestionsCount = ratingQuestionIds.length;
        
        if (ratingQuestionIds.length > 0) {
          const ratingAnswers = answersData?.filter(
            a => ratingQuestionIds.includes(a.question_id) && a.rating !== undefined && a.rating !== null
          ) || [];
          
          ratingAnswersCount = ratingAnswers.length;
          
          if (ratingAnswers.length > 0) {
            const sumRatings = ratingAnswers.reduce((sum, answer) => sum + (answer.rating || 0), 0);
            avgRating = (sumRatings / ratingAnswers.length).toFixed(2);
          }
        }
      }
      
      const createdDate = new Date(survey.created_at).toLocaleDateString();
      
      const escapedTitle = `"${survey.title.replace(/"/g, '""')}"`;
      const escapedDescription = survey.description ? `"${survey.description.replace(/"/g, '""')}"` : '""';
      
      csvContent += `${survey.id},${escapedTitle},${escapedDescription},${survey.status},${createdDate},${positiveVotes},${negativeVotes},${questionCount},${ratingQuestionsCount},${ratingAnswersCount},${avgRating}\n`;
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `all_surveys_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error("Error exporting all surveys:", error);
    return false;
  }
};