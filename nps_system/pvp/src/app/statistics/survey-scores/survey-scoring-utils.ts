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

export const calculateNPSScore = (ratings: number[]): number => {
  if (!ratings || ratings.length === 0) return 0;

  const promoters = ratings.filter(r => r >= 9).length;
  const detractors = ratings.filter(r => r <= 6).length;

  const promoterPercentage = (promoters / ratings.length) * 100;
  const detractorPercentage = (detractors / ratings.length) * 100;

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
  textQuestionsCount: number;
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
      return {
        score: 0,
        ratingQuestionsCount: 0,
        binaryQuestionsCount: 0,
        textQuestionsCount: 0,
        totalAnswersCount: 0,
      };
    }

    const questionIds = questionsData.map((q) => q.id);

    const ratingQuestions = questionsData.filter((q) => q.type === 'rating');
    const binaryQuestions = questionsData.filter((q) => q.type === 'binary');
    const textQuestions = questionsData.filter((q) => q.type === 'text');

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
        textQuestionsCount: textQuestions.length,
        totalAnswersCount: 0,
      };
    }

    let ratingScore = 0;
    let totalRatingAnswers = 0;
    let binaryScore = 0;
    let totalBinaryAnswers = 0;
    let totalTextAnswers = 0;

    // RATING
    if (ratingQuestions.length > 0) {
      const ratingQuestionIds = ratingQuestions.map((q) => q.id);
      const ratingAnswers = answersData.filter(
          (a) => ratingQuestionIds.includes(a.question_id) && a.rating != null
      );

      if (ratingAnswers.length > 0) {
        const ratings = ratingAnswers.map((a) => a.rating!);
        ratingScore = calculateNPSScore(ratings);
        totalRatingAnswers = ratingAnswers.length;
      }
    }

    // BINARY
    if (binaryQuestions.length > 0) {
      const binaryQuestionIds = binaryQuestions.map((q) => q.id);
      const binaryAnswers = answersData.filter((a) =>
          binaryQuestionIds.includes(a.question_id)
      );

      if (binaryAnswers.length > 0) {
        const positivePercentage = calculatePositivePercentage(binaryAnswers);
        binaryScore = positivePercentage * 2 - 100;
        totalBinaryAnswers = binaryAnswers.length;
      }
    }

    // TEXT
    if (textQuestions.length > 0) {
      const textQuestionIds = textQuestions.map((q) => q.id);
      const textAnswers = answersData.filter((a) =>
          textQuestionIds.includes(a.question_id)
      );
      totalTextAnswers = textAnswers.length;
    }

    const totalAnswers =
        totalRatingAnswers + totalBinaryAnswers + totalTextAnswers;

    if (totalAnswers === 0) {
      return {
        score: 0,
        ratingQuestionsCount: ratingQuestions.length,
        binaryQuestionsCount: binaryQuestions.length,
        textQuestionsCount: textQuestions.length,
        totalAnswersCount: 0,
      };
    }

    const weightedScore =
        (ratingScore * totalRatingAnswers + binaryScore * totalBinaryAnswers) /
        (totalRatingAnswers + totalBinaryAnswers || 1); // avoid div by 0

    return {
      score: Math.round(weightedScore),
      ratingQuestionsCount: ratingQuestions.length,
      binaryQuestionsCount: binaryQuestions.length,
      textQuestionsCount: textQuestions.length,
      totalAnswersCount: totalAnswers,
    };
  } catch (error) {
    console.error('Error calculating survey score:', error);
    return {
      score: 0,
      ratingQuestionsCount: 0,
      binaryQuestionsCount: 0,
      textQuestionsCount: 0,
      totalAnswersCount: 0,
    };
  }
};
