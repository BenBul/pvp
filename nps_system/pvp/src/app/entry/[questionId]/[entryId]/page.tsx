"use client"

import { useParams } from 'next/navigation'
import {useEffect, useState} from "react";
import {supabase} from "@/supabase/client";

export default function EntryPage() {
    const { questionId, entryId } = useParams()
    const [isLoading, setIsLoading] = useState(true);
    const [isPositive, setIsPositive] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if(isLoading)
            handleSubmitAnswer();
    }, [isLoading]) // Added dependency array

    const handleSubmitAnswer = async () => {
        setIsLoading(false);

        // First get the entry value
        const { data, error } = await supabase
            .from('entries')
            .select('value')
            .eq('id', entryId)
            .single();

        if (error) throw error;

        // Determine the positivity from the data
        const entryIsPositive = data?.value === "positive";

        // Update state
        setIsPositive(entryIsPositive);

        // Now use the correct value directly in the insert
        const { error: answerError } = await supabase
            .from('answers')
            .insert({
                question_id: questionId,
                ispositive: entryIsPositive, // Use the local variable, not the state
                entry: entryId,
            });

        if (answerError) throw answerError;
        setSuccess(true);
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800">
                Question ID: <span className="text-blue-600">{questionId}</span>
                Entry ID: <span className="text-blue-600">{entryId}</span>
            </h1>
            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                    <strong className="font-bold">Success!</strong>
                    <span className="block sm:inline"> Answer submitted successfully.</span>
                    <p className="mt-2">
                        Status: {isPositive ? "Positive" : "Negative"}
                    </p>
                </div>
            )}
        </div>
    )
}