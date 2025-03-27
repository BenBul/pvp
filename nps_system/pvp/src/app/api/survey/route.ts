import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = 10;
  
  try {
    const totalItems = await prisma.survey.count();
    const totalPages = Math.ceil(totalItems / pageSize);
    
    const surveyItems = await prisma.survey.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        created_at: 'desc'
      }
    });
    
    const itemsWithCounts = surveyItems.map(item => ({
      ...item,
      positiveVotes: Math.floor(Math.random() * 100),
      negativeVotes: Math.floor(Math.random() * 100),
      createdAt: item.created_at.toISOString(),
    }));
    
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
  } finally {
    await prisma.$disconnect();
  }
}