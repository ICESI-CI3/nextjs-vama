// Tipos para el sistema de juego

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

export interface Trivia {
  id: string;
  title: string;
  category_id: string;
  category?: Category;
  difficulty_level: 'easy' | 'medium' | 'hard';
  status: 'draft' | 'published' | 'archived';
  time_limit_seconds?: number;
  is_public: boolean;
  plays_count: number;
  avg_score: number;
  created_by: string;
  creator?: {
    id: string;
    name: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface Question {
  question_id: string;
  order: number;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false';
  points_value: number;
  options: QuestionOption[];
}

export interface QuestionOption {
  option_id: string;
  option_text: string;
  order: number;
}

export interface GameSession {
  session_id: string;
  trivia_id: string;
  trivia_title?: string;
  player_id: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  current_question: number;
  total_questions: number;
  correct_answers: number;
  total_score: number;
  time_spent_seconds: number;
  time_limit_per_question?: number;
  started_at: string;
  completed_at?: string;
  questions?: Question[];
}

export interface CreateGameSessionDto {
  trivia_id: string;
}

export interface SubmitAnswerDto {
  question_id: string;
  selected_option_id: string;
  time_taken_seconds: number;
}

export interface AnswerResponse {
  question_id: string;
  question_text: string;
  selected_option_id: string;
  selected_option_text: string;
  is_correct: boolean;
  points_earned: number;
  time_taken_seconds: number;
  correct_answer?: string;
  correct_option?: {
    option_id: string;
    option_text: string;
  };
}

// OpenTDB Types
export interface OpenTDBCategory {
  id: number;
  name: string;
}

export interface OpenTDBCategoriesResponse {
  trivia_categories: OpenTDBCategory[];
}

export interface OpenTDBQuestion {
  category: string;
  type: 'multiple' | 'boolean';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export interface OpenTDBResponse {
  response_code: number;
  results: OpenTDBQuestion[];
}

export interface FetchQuestionsDto {
  amount: number;
  category?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  type?: 'multiple' | 'boolean';
  encode?: 'urlLegacy' | 'url3986' | 'base64';
  token?: string;
}

