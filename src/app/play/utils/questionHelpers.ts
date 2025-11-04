import { decodeHtmlEntities } from '@/lib/html-decoder';
import { Question } from '@/types/game';

/**
 * Decodifica las entidades HTML de una pregunta y sus opciones
 */
export function decodeQuestion(question: Question): Question {
  return {
    ...question,
    question_text: decodeHtmlEntities(question.question_text),
    options: question.options.map(opt => ({
      ...opt,
      option_text: decodeHtmlEntities(opt.option_text),
    })),
  };
}

/**
 * Mapeo de dificultad a puntos
 */
export const DIFFICULTY_POINTS: { [key: string]: number } = {
  easy: 5,
  medium: 10,
  hard: 15,
};

/**
 * Transforma preguntas de OpenTDB al formato de la aplicación
 */
export function transformOpenTDBQuestions(
  openTDBResults: any[],
  triviaId: string
) {
  return openTDBResults.map((q) => {
    // Decodificar entidades HTML de OpenTDB
    const decodedQuestion = decodeHtmlEntities(q.question);
    const decodedCorrectAnswer = decodeHtmlEntities(q.correct_answer);
    const decodedIncorrectAnswers = q.incorrect_answers.map((ans: string) =>
      decodeHtmlEntities(ans)
    );

    const allDecodedAnswers = [decodedCorrectAnswer, ...decodedIncorrectAnswers];
    const shuffledDecodedAnswers = allDecodedAnswers.sort(() => Math.random() - 0.5);

    return {
      trivia_id: triviaId,
      question_text: decodedQuestion,
      question_type: (q.type === 'boolean' ? 'true_false' : 'multiple_choice') as
        | 'multiple_choice'
        | 'true_false',
      options: shuffledDecodedAnswers.map((ans) => ({
        text: ans,
        is_correct: ans === decodedCorrectAnswer,
      })),
      correct_answer: decodedCorrectAnswer,
      points_value: DIFFICULTY_POINTS[q.difficulty] || 10,
    };
  });
}

