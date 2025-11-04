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

