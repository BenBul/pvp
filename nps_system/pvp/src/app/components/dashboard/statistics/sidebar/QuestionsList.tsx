import React from 'react';
import { List, ListItem, ListItemButton, ListItemText, Chip } from '@mui/material';
import { IQuestion } from '../../../../types/survey';

interface QuestionsListProps {
    questions: IQuestion[];
    onQuestionClick: (questionId: string) => void;
}

const QuestionsList: React.FC<QuestionsListProps> = ({ questions, onQuestionClick }) => {
    return (
        <List>
            {questions.map((question) => (
                <ListItem key={question.id} >
                    <ListItemButton onClick={() => onQuestionClick(question.id)}>
                        <ListItemText primary={question.description} secondary={question.type} />
                        {question.isDeleted && (
                            <Chip label="Deleted" color="error" size="small" sx={{ ml: 1 }} />
                        )}
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    );
};

export default QuestionsList;