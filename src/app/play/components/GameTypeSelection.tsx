'use client';

import { OwnTriviasSelection } from './OwnTriviasSelection';
import { OpenTDBSelection } from './OpenTDBSelection';

interface GameTypeSelectionProps {
  gameType: 'own' | 'opentdb';
  onStartGame: (triviaId: string) => void;
  onBack: () => void;
  loading: boolean;
}

export function GameTypeSelection({
  gameType,
  onStartGame,
  onBack,
  loading,
}: GameTypeSelectionProps) {
  if (gameType === 'own') {
    return <OwnTriviasSelection onStartGame={onStartGame} onBack={onBack} loading={loading} />;
  } else {
    return <OpenTDBSelection onStartGame={onStartGame} onBack={onBack} loading={loading} />;
  }
}

