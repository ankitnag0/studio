import { config } from 'dotenv';
config();

import '@/ai/flows/enhance-game-prompt.ts';
import '@/ai/flows/generate-game-code.ts';
import '@/ai/flows/generate-game-brief.ts';
import '@/ai/flows/iteratively-improve-game.ts';