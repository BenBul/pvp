import { supabase } from '@/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

type RouteContext = {
    params: {
        id: string;
    };
};

export async function POST(
    request: NextRequest,
    { params }: RouteContext
): Promise<NextResponse> {
    const questionId = params.id;
    const { customCode } = await request.json();
    const shortCode = customCode?.trim() || Math.random().toString(36).substring(2, 8);

    const { data, error } = await supabase
        .from('questions')
        .update({ short_code: shortCode })
        .eq('id', questionId)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, short_code: data.short_code });
} 