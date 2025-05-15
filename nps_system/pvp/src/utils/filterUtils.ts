import { TableData } from '../app/types/survey';

export const applyFilters = (
    tableData: TableData[],
    ratingRangeFilter: [number, number] | null,
    responseFilter: string,
    questionFilter: string
): TableData[] => {
    return tableData.filter(item => {
        if (ratingRangeFilter !== null) {
            if (item.rating === 'N/A') return false;
            const rating = Number(item.rating);
            if (rating < ratingRangeFilter[0] || rating > ratingRangeFilter[1]) return false;
        }

        if (responseFilter !== 'all') {
            if (responseFilter === 'positive' && item.ispositive !== 'Yes') return false;
            if (responseFilter === 'negative' && item.ispositive !== 'No') return false;
        }

        if (questionFilter && !item.question.toLowerCase().includes(questionFilter.toLowerCase())) {
            return false;
        }

        return true;
    });
};