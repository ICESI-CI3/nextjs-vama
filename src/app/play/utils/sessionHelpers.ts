import { gameSessionsService } from '@/services/game-sessions.service';

/**
 * Intenta completar una sesión con sistema de reintentos
 * @param sessionId ID de la sesión
 * @param maxRetries Número máximo de reintentos
 * @param delayMs Delay entre reintentos en milisegundos
 * @returns La sesión completada
 */
export async function completeSessionWithRetry(
  sessionId: string,
  maxRetries: number = 5,
  delayMs: number = 2000
) {
  let retryCount = 0;
  let lastError = null;

  while (retryCount < maxRetries) {
    try {
      // Esperar antes de cada intento
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }

      // Obtener estado más reciente de la sesión específica
      const freshSession = await gameSessionsService.getSessionById(sessionId);

      // Si la sesión ya está completada o abandonada, retornarla directamente
      if (freshSession.status === 'completed' || freshSession.status === 'abandoned') {
        console.log('✅ Sesión ya completada/abandonada, retornando estado actual');
        // Retornar la sesión en el formato esperado
        return {
          session_id: freshSession.session_id || freshSession.id,
          trivia_id: freshSession.trivia?.id || freshSession.trivia_id,
          trivia_title: freshSession.trivia?.title,
          player_id: freshSession.player?.id || freshSession.player_id,
          status: freshSession.status,
          current_question: freshSession.current_question,
          total_questions: freshSession.total_questions,
          correct_answers: freshSession.correct_answers,
          total_score: freshSession.total_score,
          time_spent_seconds: freshSession.time_spent_seconds,
          started_at: freshSession.started_at,
          completed_at: freshSession.completed_at,
        };
      }

      // Verificar que todas las preguntas han sido respondidas
      if (freshSession.current_question >= freshSession.total_questions) {
        // Intentar completar con la sesión fresca
        const completedSession = await gameSessionsService.completeSession(sessionId);
        return completedSession;
      } else {
        // Si aún no se han respondido todas las preguntas, esperar más
        retryCount++;
        continue;
      }
    } catch (err: any) {
      lastError = err;
      const errorMessage = err.response?.data?.message || 'Error al completar la sesión';

      // Si la sesión ya fue completada o abandonada, retornar el estado actual
      if (errorMessage.includes('ya fue completada') || errorMessage.includes('ya fue abandonada')) {
        console.log('ℹ️ Sesión ya completada/abandonada, obteniendo estado actual');
        try {
          const freshSession = await gameSessionsService.getSessionById(sessionId);
          return {
            session_id: freshSession.session_id || freshSession.id,
            trivia_id: freshSession.trivia?.id || freshSession.trivia_id,
            trivia_title: freshSession.trivia?.title,
            player_id: freshSession.player?.id || freshSession.player_id,
            status: freshSession.status,
            current_question: freshSession.current_question,
            total_questions: freshSession.total_questions,
            correct_answers: freshSession.correct_answers,
            total_score: freshSession.total_score,
            time_spent_seconds: freshSession.time_spent_seconds,
            started_at: freshSession.started_at,
            completed_at: freshSession.completed_at,
          };
        } catch (getErr) {
          // Si no podemos obtener el estado, lanzar el error original
          throw err;
        }
      }

      if (errorMessage.includes('responder todas') && retryCount < maxRetries - 1) {
        retryCount++;
        continue;
      }

      // Si no es error de sincronización o es el último intento, lanzar
      throw err;
    }
  }

  // Si llegamos aquí, todos los intentos fallaron
  throw lastError || new Error('No se pudo completar la sesión después de varios intentos');
}

/**
 * Valida el formulario de OpenTDB
 */
export function validateOpenTDBForm(amount: string): number {
  const numAmount = parseInt(amount);
  if (isNaN(numAmount) || numAmount < 1) {
    throw new Error('Por favor, ingresa un número válido de preguntas (mínimo 1)');
  }
  return numAmount;
}

