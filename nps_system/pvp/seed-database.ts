// seed-database.ts
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Type definitions
interface UserData {
  username: string;
  email: string;
  role: string;
}

interface AnswerData {
  answer_text: string;
  rating?: number;
}

interface QuestionData {
  question_text: string;
  question_type: string;
  answers: AnswerData[];
}

interface SurveyData {
  title: string;
  description: string;
  status: string;
  questions: QuestionData[];
}

// Sample data
const sampleUsers: UserData[] = [
  {
    username: 'admin',
    email: 'admin@surveyapp.com',
    role: 'ADMIN',
  },
  {
    username: 'researcher1',
    email: 'researcher1@surveyapp.com',
    role: 'RESEARCHER',
  },
  {
    username: 'researcher2',
    email: 'researcher2@surveyapp.com',
    role: 'RESEARCHER',
  },
  {
    username: 'respondent1',
    email: 'respondent1@surveyapp.com',
    role: 'USER',
  },
  {
    username: 'respondent2',
    email: 'respondent2@surveyapp.com',
    role: 'USER',
  },
];

const sampleSurveys: SurveyData[] = [
  {
    title: 'Customer Satisfaction Survey',
    description: 'Help us improve our services by sharing your experience',
    status: 'ACTIVE',
    questions: [
      {
        question_text: 'How satisfied are you with our product?',
        question_type: 'RATING',
        answers: [
          { answer_text: '', rating: 4 },
          { answer_text: '', rating: 5 },
          { answer_text: '', rating: 3 },
        ],
      },
      {
        question_text: 'What features would you like to see improved?',
        question_type: 'TEXT',
        answers: [
          { answer_text: 'Better mobile experience' },
          { answer_text: 'More customization options' },
        ],
      },
    ],
  },
  {
    title: 'Employee Engagement Survey',
    description: 'Share your thoughts about workplace environment',
    status: 'ACTIVE',
    questions: [
      {
        question_text: 'How likely are you to recommend our company as a great place to work?',
        question_type: 'RATING',
        answers: [
          { answer_text: '', rating: 5 },
          { answer_text: '', rating: 4 },
        ],
      },
      {
        question_text: 'What could we do to improve our workplace culture?',
        question_type: 'TEXT',
        answers: [
          { answer_text: 'More team building activities' },
          { answer_text: 'Better communication from leadership' },
        ],
      },
    ],
  },
];

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await prisma.$transaction([
      prisma.answer.deleteMany(),
      prisma.question.deleteMany(),
      prisma.survey.deleteMany(),
      prisma.follows.deleteMany(),
      prisma.user.deleteMany(),
    ]);
    console.log('Deleted all existing data');

    // Create users
    const createdUsers = await Promise.all(
      sampleUsers.map(async (user) => {
        return prisma.user.create({
          data: {
            id: uuidv4(),
            username: user.username,
            email: user.email,
            role: user.role,
            created_at: new Date(),
          },
        });
      })
    );
    console.log(`Created ${createdUsers.length} users`);

    // Get admin and researcher users
    const adminUser = createdUsers.find(u => u.role === 'ADMIN');
    const researchers = createdUsers.filter(u => u.role === 'RESEARCHER');
    const respondents = createdUsers.filter(u => u.role === 'USER');

    if (!adminUser || researchers.length === 0 || respondents.length === 0) {
      throw new Error('Required user roles not created');
    }

    // Create surveys with questions and answers
    for (const surveyData of sampleSurveys) {
      const researcher = researchers[Math.floor(Math.random() * researchers.length)];
      
      const survey = await prisma.survey.create({
        data: {
          id: uuidv4(),
          title: surveyData.title,
          description: surveyData.description,
          status: surveyData.status,
          created_at: new Date(),
          user_id: researcher.id,
          questions: {
            create: surveyData.questions.map(questionData => ({
              id: uuidv4(),
              question_text: questionData.question_text,
              question_type: questionData.question_type,
              qr_code: `QR-${Math.random().toString(36).substring(2, 10)}`,
              created_at: new Date(),
              answers: {
                create: questionData.answers.map(answerData => {
                  const randomRespondent = respondents[Math.floor(Math.random() * respondents.length)];
                  return {
                    id: uuidv4(),
                    answer_text: answerData.answer_text,
                    rating: answerData.rating ?? null,
                    created_at: new Date(),
                    user_id: randomRespondent.id,
                  };
                }),
              },
            })),
          },
        },
        include: {
          questions: {
            include: {
              answers: true,
            },
          },
        },
      });

      console.log(`Created survey "${survey.title}" with ${survey.questions.length} questions`);
    }

    // Create some follow relationships
    await prisma.follows.createMany({
      data: [
        {
          following_user_id: respondents[0].id,
          followed_user_id: researchers[0].id,
          created_at: new Date(),
        },
        {
          following_user_id: respondents[1].id,
          followed_user_id: researchers[1].id,
          created_at: new Date(),
        },
        {
          following_user_id: researchers[0].id,
          followed_user_id: adminUser.id,
          created_at: new Date(),
        },
      ],
    });
    console.log('Created follow relationships');

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();