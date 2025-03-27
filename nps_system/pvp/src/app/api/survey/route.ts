import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { supabase } from '@/supabase/client';
const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = 10;
  
  try {
    // Calculate the range for pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Fetch total count of surveys
    const { count: totalItems, error: countError } = await supabase
      .from('surveys')
      .select('*', { count: 'exact' });

    if (countError) {
      throw countError;
    }

    // Fetch paginated survey items
    const { data: surveyItems, error } = await supabase
      .from('surveys')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw error;
    }

    // Add vote counts (you might want to replace this with actual vote data from your database)
    const itemsWithCounts = surveyItems.map(item => ({
      ...item,
      positiveVotes: Math.floor(Math.random() * 100),
      negativeVotes: Math.floor(Math.random() * 100),
      createdAt: item.created_at,
    }));

    // Calculate total pages
    const totalPages = Math.ceil((totalItems || 0) / pageSize);

    return NextResponse.json({
      items: itemsWithCounts,
      totalPages,
      page
    });
  } catch (error) {
    console.error('Error fetching survey items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch survey items' },
      { status: 500 }
    );
  }
}