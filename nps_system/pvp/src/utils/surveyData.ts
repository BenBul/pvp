import { IQuestion, IAnswer, NPSData, BinaryData, TableData } from '@/types/survey';

export const processBinaryQuestionsData = (
    questions: IQuestion[], 
    answers: IAnswer[]
): BinaryData[] => {
    const binaryQuestions = questions.filter(q => q.type === 'binary');
    
    const binaryData = binaryQuestions.map(question => {
        const questionAnswers = answers.filter(answer => answer.question_id === question.id);
        const positiveCount = questionAnswers.filter(a => a.ispositive).length;
        const negativeCount = questionAnswers.filter(a => a.ispositive === false).length;
        
        return {
            question: question.description.length > 20 
                ? question.description.substring(0, 20) + '...' 
                : question.description,
            positiveCount,
            negativeCount,
            totalCount: questionAnswers.length
        };
    });

    return binaryData;
};

export const processComprehensiveNPSData = (
    questions: IQuestion[], 
    answers: IAnswer[]
): NPSData[] => {
    const ratingQuestions = questions.filter(q => q.type === 'rating');
    const binaryQuestions = questions.filter(q => q.type === 'binary');
    
    const combinedData: NPSData[] = [];
    
    ratingQuestions.forEach((question, index) => {
        const questionAnswers = answers.filter(answer => 
            answer.question_id === question.id && 
            answer.rating !== null && 
            answer.rating !== undefined
        );
        
        if (questionAnswers.length === 0) return;
        
        const promoters = questionAnswers.filter(a => (a.rating || 0) >= 9).length;
        const passives = questionAnswers.filter(a => (a.rating || 0) >= 7 && (a.rating || 0) <= 8).length;
        const detractors = questionAnswers.filter(a => (a.rating || 0) <= 6).length;
        
        const totalResponses = questionAnswers.length;
        const promoterPercentage = (promoters / totalResponses) * 100;
        const passivePercentage = (passives / totalResponses) * 100;
        const detractorPercentage = (detractors / totalResponses) * 100;
        
        const npsScore = Math.round(promoterPercentage - detractorPercentage);
        
        combinedData.push({
            question: question.description.length > 25 
                ? question.description.substring(0, 25) + '...' 
                : question.description,
            questionId: question.id,
            questionType: 'rating',
            npsScore: npsScore,
            responseCount: totalResponses,
            promoters: promoters,
            promoterPercentage: Math.round(promoterPercentage),
            passives: passives,
            passivePercentage: Math.round(passivePercentage),
            detractors: detractors,
            detractorPercentage: Math.round(detractorPercentage),
            xPosition: combinedData.length + 1
        });
    });
    
    binaryQuestions.forEach((question) => {
        const questionAnswers = answers.filter(answer => 
            answer.question_id === question.id && 
            answer.ispositive !== null && 
            answer.ispositive !== undefined
        );
        
        if (questionAnswers.length === 0) return;
        
        const positiveAnswers = questionAnswers.filter(a => a.ispositive === true).length;
        const negativeAnswers = questionAnswers.filter(a => a.ispositive === false).length;
        
        const totalResponses = questionAnswers.length;
        const promoterPercentage = (positiveAnswers / totalResponses) * 100;
        const detractorPercentage = (negativeAnswers / totalResponses) * 100;
        
        const npsScore = Math.round(promoterPercentage - detractorPercentage);
        
        combinedData.push({
            question: question.description.length > 25 
                ? question.description.substring(0, 25) + '...' 
                : question.description,
            questionId: question.id,
            questionType: 'binary',
            npsScore: npsScore,
            responseCount: totalResponses,
            promoters: positiveAnswers,
            promoterPercentage: Math.round(promoterPercentage),
            passives: 0, 
            passivePercentage: 0,
            detractors: negativeAnswers,
            detractorPercentage: Math.round(detractorPercentage),
            xPosition: combinedData.length + 1
        });
    });
    
    if (combinedData.length > 0) {
        const totalPromotors = combinedData.reduce((sum, item) => sum + item.promoters, 0);
        const totalDetractors = combinedData.reduce((sum, item) => sum + item.detractors, 0);
        const totalResponses = combinedData.reduce((sum, item) => sum + item.responseCount, 0);
        
        if (totalResponses > 0) {
            const overallPromoterPercentage = (totalPromotors / totalResponses) * 100;
            const overallDetractorPercentage = (totalDetractors / totalResponses) * 100;
            const overallNPSScore = Math.round(overallPromoterPercentage - overallDetractorPercentage);
            
            // You could add an overall NPS item to the data if desired
            // (Uncomment this if you want to show a summary item in the chart)
            /*
            combinedData.push({
                question: "Overall NPS",
                questionId: "overall",
                questionType: 'summary',
                npsScore: overallNPSScore,
                responseCount: totalResponses,
                promoters: totalPromotors,
                promoterPercentage: Math.round(overallPromoterPercentage),
                passives: totalResponses - totalPromotors - totalDetractors,
                passivePercentage: Math.round(100 - overallPromoterPercentage - overallDetractorPercentage),
                detractors: totalDetractors,
                detractorPercentage: Math.round(overallDetractorPercentage),
                xPosition: combinedData.length + 1
            });
            */
        }
    }
    
    return combinedData;
};

export const createTableData = (
    questions: IQuestion[], 
    answers: IAnswer[]
): TableData[] => {
    return answers.map((answer) => {
        const question = questions.find((q) => q.id === answer.question_id)?.description || 'Unknown Question';
        return {
            question,
            created_at: new Date(answer.created_at).toLocaleString(),
            ispositive: answer.ispositive !== undefined ? (answer.ispositive ? 'Yes' : 'No') : 'N/A',
            rating: answer.rating !== undefined ? answer.rating : 'N/A',
            input: answer.input || 'N/A',
            question_id: answer.question_id,
        };
    });
};