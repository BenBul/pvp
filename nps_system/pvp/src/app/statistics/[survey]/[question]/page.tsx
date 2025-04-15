'use client';

import {Typography} from "@mui/material";
import QuestionTemplate from "@/app/components/dashboard/statistics/QuestionTemplate";
import React from "react";

export default function QuestionStatistics() {
    return(
        <QuestionTemplate
            headers={[
                { key: 'user', label: 'User' },
                { key: 'response', label: 'Response' },
                { key: 'date', label: 'Date' },
            ]}
            data={[
                { user: 'Alice', response: 'Yes', date: '2025-04-01' },
                { user: 'Bob', response: 'No', date: '2025-04-02' },
            ]}
            chart1={
                <div>
                    <h3>Custom Chart 1</h3>
                </div>
            }
            chart2={
                <div>
                    <h3>Custom Chart 1</h3>
                </div>
            }
            chart3={
                <div>
                    <h3>Custom Chart 1</h3>
                </div>
            }
            chart4={
                <div>
                    <h3>Custom Chart 1</h3>
                </div>
            }
        />
    )
}