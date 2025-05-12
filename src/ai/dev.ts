import { config } from 'dotenv';
config();

import '@/ai/flows/generate-game-code.ts';
import '@/ai/flows/generate-game-brief.ts';
import '@/ai/flows/iteratively-improve-game.ts';
