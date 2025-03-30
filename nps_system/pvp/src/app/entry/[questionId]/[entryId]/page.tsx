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
    })
    const handleSubmitAnswer = async () => {
        setIsLoading(false);

        const { data, error } = await supabase
            .from('entries')
            .select('value')
            .eq('id', entryId)
            .single();

        if (error) throw error;

        if (data) {
            if(data.value === "positive")
                setIsPositive(true);
            else setIsPositive(false);
        }

        const { error: answerError } = await supabase
            .from('answers')
            .insert({
                question_id: questionId,
                ispositive: isPositive,
                entry: entryId,
            });

        if (answerError) throw answerError;
        setSuccess(true);
        return;
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