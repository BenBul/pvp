"use client"

import { useParams } from 'next/navigation';
import React, { useState } from "react";
import { supabase } from "@/supabase/client";

export default function Page() {
    const { surveyId } = useParams();
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState("");

    const handleCreateBoolQuestion = async () => {
        setIsCreating(true);
        setError("");

        const questionId = crypto.randomUUID();
        const positiveEntryId = crypto.randomUUID();
        const negativeEntryId = crypto.randomUUID();

        try {
            const positiveResponse = await fetch("/api/qr", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    color: "#008000",
                    URL: `localhost:3000/entry/${questionId}/${positiveEntryId}`
                }),
            });

            const negativeResponse = await fetch("/api/qr", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    color: "#ff0000",
                    URL: `localhost:3000/entry/${questionId}/${negativeEntryId}`
                }),
            });

            const positiveData = await positiveResponse.json();
            const negativeData = await negativeResponse.json();

            const { error: questionError } = await supabase
                .from('questions')
                .insert({
                    id: questionId,
                    description: "description",
                    type: "binary",
                    survey_id: surveyId,
                });

            if (questionError) throw questionError;

            const { error: entriesError } = await supabase
                .from('entries')
                .insert([
                    {
                        id: positiveEntryId,
                        url: positiveData.url,
                        question_id: questionId,
                        value: "positive"
                    },
                    {
                        id: negativeEntryId,
                        url: negativeData.url,
                        question_id: questionId,
                        value: "negative"
                    }
                ]);

            if (entriesError) throw entriesError;

        } catch (error) {
            console.error("Error creating question and QR codes:", error);
            setError("Failed to create question. Please try again.");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Survey Page</h1>
            <p>Survey ID: {surveyId}</p>

            <button
                onClick={handleCreateBoolQuestion}
                disabled={isCreating}
            >
                {isCreating ? "Creating..." : "Create a new bool question"}
            </button>

            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}