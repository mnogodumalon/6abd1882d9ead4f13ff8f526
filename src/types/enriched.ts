import type { Keyboards } from './app';

export type EnrichedKeyboards = Keyboards & {
  herstellerName: string;
};
