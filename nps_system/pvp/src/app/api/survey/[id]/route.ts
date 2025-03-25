import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch a specific survey by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    const survey = await prisma.survey.findUnique({
      where: { id }
    });
    
    if (!survey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(survey);
  } catch (error) {
    console.error('Error fetching survey:', error);
    return NextResponse.json(
      { error: 'Failed to fetch survey' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update a survey
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { title, description, status } = body;
    
    // Check if survey exists
    const existingSurvey = await prisma.survey.findUnique({
      where: { id }
    });
    
    if (!existingSurvey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      );
    }
    
    // Update survey
    const updatedSurvey = await prisma.survey.update({
      where: { id },
      data: {
        title,
        description,
        status
      }
    });
    
    return NextResponse.json(updatedSurvey);
  } catch (error) {
    console.error('Error updating survey:', error);
    return NextResponse.json(
      { error: 'Failed to update survey' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete a survey
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Check if survey exists
    const existingSurvey = await prisma.survey.findUnique({
      where: { id }
    });
    
    if (!existingSurvey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      );
    }
    
    // Delete all questions first (if they exist)
    await prisma.question.deleteMany({
      where: { survey_id: id }
    });
    
    // Delete the survey
    await prisma.survey.delete({
      where: { id }
    });
    
    return NextResponse.json(
      { message: 'Survey deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting survey:', error);
    return NextResponse.json(
      { error: 'Failed to delete survey' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}