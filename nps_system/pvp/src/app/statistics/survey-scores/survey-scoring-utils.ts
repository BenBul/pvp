import { supabase } from '@/supabase/client';

type Question = {
  id: string;
  type: string;
  survey_id: string;
};

type Answer = {
  id: string;
  question_id: string;
  ispositive?: boolean;
  rating?: number;
};

/**
 * Transforms 1-5 ratings to NPS equivalent scale (1-10)
 * 1,2 (1-5 scale) → detractors (1-6 on NPS scale)
 * 3,4 (1-5 scale) → passives (7-8 on NPS scale)
 * 5 (1-5 scale) → promoters (9-10 on NPS scale)
 */
export const transformRatingToNPSScale = (rating: number): number => {
  if (rating <= 2) {
    // 1,2 → detractors (map to 1-6 range)
    return rating <= 1 ? 1 : 6;
  } else if (rating <= 4) {
    // 3,4 → passives (map to 7-8 range)
    return rating === 3 ? 7 : 8;
  } else {
    // 5 → promoters (map to 9-10 range)
    return 10;
  }
};

export const calculateNPSScore = (ratings: number[]): number => {
  if (!ratings || ratings.length === 0) return 0;
  
  // Transform 1-5 scale ratings to NPS scale before calculating
  const transformedRatings = ratings.map(transformRatingToNPSScale);
  
  const promoters = transformedRatings.filter(r => r >= 9).length;
  const detractors = transformedRatings.filter(r => r <= 6).length;
  
  const promoterPercentage = (promoters / transformedRatings.length) * 100;
  const detractorPercentage = (detractors / transformedRatings.length) * 100;
  
  return Math.round(promoterPercentage - detractorPercentage);
};

export const calculateAverageRating = (ratings: number[]): number => {
  if (!ratings || ratings.length === 0) return 0;
  
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return parseFloat((sum / ratings.length).toFixed(1));
};

export const calculatePositivePercentage = (answers: Answer[]): number => {
  if (!answers || answers.length === 0) return 0;
  
  const positiveAnswers = answers.filter(a => a.ispositive).length;
  return Math.round((positiveAnswers / answers.length) * 100);
};

export const calculateUnifiedSurveyScore = async (surveyId: string): Promise<{
  score: number;
  ratingQuestionsCount: number;
  binaryQuestionsCount: number;
  totalAnswersCount: number;
}> => {
  try {
    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .select('id, type')
      .eq('survey_id', surveyId)
      .eq('is_deleted', false);
    
    if (questionsError) throw questionsError;
    
    if (!questionsData || questionsData.length === 0) {
      return { score: 0, ratingQuestionsCount: 0, binaryQuestionsCount: 0, totalAnswersCount: 0 };
    }
    
    const questionIds = questionsData.map(q => q.id);
    
    const ratingQuestions = questionsData.filter(q => q.type === 'rating');
    const binaryQuestions = questionsData.filter(q => q.type === 'binary');
    
    const { data: answersData, error: answersError } = await supabase
      .from('answers')
      .select('*')
      .in('question_id', questionIds);
    
    if (answersError) throw answersError;
    
    if (!answersData || answersData.length === 0) {
      return { 
        score: 0, 
        ratingQuestionsCount: ratingQuestions.length, 
        binaryQuestionsCount: binaryQuestions.length, 
        totalAnswersCount: 0 
      };
    }
    
    let ratingScore = 0;
    let totalRatingAnswers = 0;
    
    if (ratingQuestions.length > 0) {
      const ratingQuestionIds = ratingQuestions.map(q => q.id);
      const ratingAnswers = answersData.filter(a => 
        ratingQuestionIds.includes(a.question_id) && 
        a.rating !== undefined && 
        a.rating !== null
      );
      
      if (ratingAnswers.length > 0) {
        const ratings = ratingAnswers.map(a => a.rating!);
        ratingScore = calculateNPSScore(ratings);
        totalRatingAnswers = ratingAnswers.length;
      }
    }
    
    let binaryScore = 0;
    let totalBinaryAnswers = 0;
    
    if (binaryQuestions.length > 0) {
      const binaryQuestionIds = binaryQuestions.map(q => q.id);
      const binaryAnswers = answersData.filter(a => 
        binaryQuestionIds.includes(a.question_id)
      );
      
      if (binaryAnswers.length > 0) {
        const positivePercentage = calculatePositivePercentage(binaryAnswers);
        binaryScore = (positivePercentage * 2) - 100; 
        totalBinaryAnswers = binaryAnswers.length;
      }
    }
    
    const totalAnswers = totalRatingAnswers + totalBinaryAnswers;
    
    if (totalAnswers === 0) {
      return { 
        score: 0, 
        ratingQuestionsCount: ratingQuestions.length, 
        binaryQuestionsCount: binaryQuestions.length, 
        totalAnswersCount: 0 
      };
    }
    
    const weightedScore = (
      (ratingScore * totalRatingAnswers) + 
      (binaryScore * totalBinaryAnswers)
    ) / totalAnswers;
    
    return {
      score: Math.round(weightedScore),
      ratingQuestionsCount: ratingQuestions.length,
      binaryQuestionsCount: binaryQuestions.length,
      totalAnswersCount: totalAnswers
    };
  } catch (error) {
    console.error("Error calculating survey score:", error);
    return { score: 0, ratingQuestionsCount: 0, binaryQuestionsCount: 0, totalAnswersCount: 0 };
  }
};