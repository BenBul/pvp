export interface IQuestion {
    id: string;
    description: string;
    type: string;
    isDeleted: boolean;
}

export interface IAnswer {
    question_id: string;
    created_at: string;
    ispositive?: boolean;
    rating?: number;
    input?: string;
}

export interface TableData {
    question: string;
    created_at: string;
    ispositive: string;
    rating: number | string;
    input: string;
    question_id: string;
}

export interface NPSData {
    question: string;
    questionId: string;
    questionType: 'rating' | 'binary' | 'summary';
    npsScore: number;
    responseCount: number;
    promoters: number;
    promoterPercentage: number;
    passives: number;
    passivePercentage: number;
    detractors: number;
    detractorPercentage: number;
    xPosition: number;
}

export interface BinaryData {
    question: string;
    positiveCount: number;
    negativeCount: number;
    totalCount: number;
}