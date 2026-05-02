export { detectGames } from './gameDetector';
export { optimizeForGaming, restoreAfterGaming, getActiveOptimization } from './gameOptimizer';
export { startRecording, stopRecording, getFpsHistory, getSessionDetail, clearFpsHistory } from './fpsRecorder';
export { getGameConfig, getAllGameConfigs, saveGameConfig, deleteGameConfig } from './gameConfig';
export type { GameDetected } from './gameDetector';
export type { OptimizationStatus, OptimizationConfig } from './types';
export type { GameOverlayConfig } from './gameConfig';
