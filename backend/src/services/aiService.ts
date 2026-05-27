import OpenAI from 'openai';
import { AssignmentInput, GeneratedPaper, Section, Question } from '../types';
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const buildPrompt = (input: AssignmentInput): string => {
  const questionTypesStr = input.questionTypes.join(', ');
  const difficultyStr = input.difficulty === 'mixed'
    ? 'a mix of easy, medium, and hard'
    : input.difficulty;

  return `You are an expert educator creating a structured question paper.

Assignment Details:
- Title: ${input.title}
- Subject: ${input.subject}
- Grade Level: ${input.gradeLevel}
- Total Questions: ${input.numberOfQuestions}
- Total Marks: ${input.totalMarks}
- Difficulty: ${difficultyStr}
- Question Types: ${questionTypesStr}
- Duration: ${input.duration || '2 hours'}
${input.additionalInstructions ? `- Additional Instructions: ${input.additionalInstructions}` : ''}
${input.fileContent ? `\nReference Material:\n${input.fileContent.substring(0, 2000)}` : ''}

Generate a complete question paper in the following EXACT JSON format. Do not include any text outside the JSON:

{
  "title": "${input.title}",
  "subject": "${input.subject}",
  "totalMarks": ${input.totalMarks},
  "duration": "${input.duration || '2 Hours'}",
  "instructions": [
    "Read all questions carefully before answering",
    "Write your name and roll number clearly",
    "All questions are compulsory unless stated otherwise"
  ],
  "sections": [
    {
      "id": "section_a",
      "title": "Section A",
      "instruction": "Attempt all questions",
      "totalMarks": 20,
      "questions": [
        {
          "id": "q1",
          "text": "Question text here",
          "difficulty": "easy",
          "marks": 2,
          "type": "short_answer"
        }
      ]
    }
  ]
}

Rules:
1. Distribute ${input.numberOfQuestions} questions across 2-3 sections (Section A, B, C)
2. Section A: easy questions (short answer / MCQ)
3. Section B: medium questions
4. Section C: hard/long answer questions (if applicable)
5. Total marks across all sections must equal exactly ${input.totalMarks}
6. Each question must have difficulty: "easy", "medium", or "hard"
7. For MCQ type, include "options" array with 4 choices
8. Make questions relevant to ${input.subject} for ${input.gradeLevel} students
9. Return ONLY valid JSON, no markdown, no explanation`;
};

const parseAIResponse = (rawResponse: string): GeneratedPaper => {
  // Strip markdown code blocks if present
  let cleaned = rawResponse.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  const parsed = JSON.parse(cleaned);

  // Validate and normalize the structure
  if (!parsed.sections || !Array.isArray(parsed.sections)) {
    throw new Error('Invalid AI response: missing sections');
  }

  const paper: GeneratedPaper = {
    title: parsed.title || 'Assessment',
    subject: parsed.subject || 'General',
    totalMarks: parsed.totalMarks || 0,
    duration: parsed.duration || '2 Hours',
    instructions: Array.isArray(parsed.instructions) ? parsed.instructions : [],
    sections: parsed.sections.map((section: any): Section => ({
      id: section.id || uuidv4(),
      title: section.title || 'Section',
      instruction: section.instruction || 'Attempt all questions',
      totalMarks: section.totalMarks || 0,
      questions: Array.isArray(section.questions)
        ? section.questions.map((q: any): Question => ({
            id: q.id || uuidv4(),
            text: q.text || '',
            difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
            marks: typeof q.marks === 'number' ? q.marks : 1,
            type: q.type || 'short_answer',
            options: Array.isArray(q.options) ? q.options : undefined,
            answer: q.answer,
          }))
        : [],
    })),
  };

  return paper;
};

export const generateAssessment = async (input: AssignmentInput): Promise<GeneratedPaper> => {
  const prompt = buildPrompt(input);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an expert educator and assessment creator. Always respond with valid JSON only.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 4000,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from AI');
  }

  return parseAIResponse(content);
};

// Fallback mock generator when OpenAI is not available
export const generateMockAssessment = (input: AssignmentInput): GeneratedPaper => {
  const questionsPerSection = Math.ceil(input.numberOfQuestions / 3);
  const marksPerQuestion = Math.floor(input.totalMarks / input.numberOfQuestions);

  const createQuestions = (
    count: number,
    difficulty: 'easy' | 'medium' | 'hard',
    type: string,
    startIdx: number
  ): Question[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: uuidv4(),
      text: `${input.subject} question ${startIdx + i + 1}: Explain the concept of ${
        ['photosynthesis', 'gravity', 'democracy', 'algebra', 'evolution', 'thermodynamics'][
          (startIdx + i) % 6
        ]
      } in the context of ${input.gradeLevel} curriculum.`,
      difficulty,
      marks: marksPerQuestion,
      type: type as Question['type'],
      options:
        type === 'mcq'
          ? ['Option A: First choice', 'Option B: Second choice', 'Option C: Third choice', 'Option D: Fourth choice']
          : undefined,
    }));
  };

  const sectionACount = Math.ceil(input.numberOfQuestions * 0.4);
  const sectionBCount = Math.ceil(input.numberOfQuestions * 0.35);
  const sectionCCount = input.numberOfQuestions - sectionACount - sectionBCount;

  return {
    title: input.title,
    subject: input.subject,
    totalMarks: input.totalMarks,
    duration: input.duration || '2 Hours',
    instructions: [
      'Read all questions carefully before answering.',
      'Write your name, roll number, and section clearly on the answer sheet.',
      'All questions are compulsory unless stated otherwise.',
      'Marks are indicated against each question.',
    ],
    sections: [
      {
        id: uuidv4(),
        title: 'Section A',
        instruction: 'Attempt all questions. Each question carries equal marks.',
        totalMarks: sectionACount * marksPerQuestion,
        questions: createQuestions(sectionACount, 'easy', input.questionTypes[0] || 'short_answer', 0),
      },
      {
        id: uuidv4(),
        title: 'Section B',
        instruction: 'Attempt any four questions from this section.',
        totalMarks: sectionBCount * marksPerQuestion,
        questions: createQuestions(sectionBCount, 'medium', 'short_answer', sectionACount),
      },
      ...(sectionCCount > 0
        ? [
            {
              id: uuidv4(),
              title: 'Section C',
              instruction: 'Attempt any two questions. Each question carries higher marks.',
              totalMarks: sectionCCount * marksPerQuestion,
              questions: createQuestions(sectionCCount, 'hard', 'long_answer', sectionACount + sectionBCount),
            },
          ]
        : []),
    ],
  };
};
