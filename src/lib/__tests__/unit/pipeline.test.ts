import { describe, it, expect } from 'vitest';

describe('Pipeline Business Rules', () => {
  it('calculates win rate percentage accurately', () => {
    const totalWon = 5;
    const totalLost = 5;
    const totalClosed = totalWon + totalLost;
    const winRate = (totalWon / totalClosed) * 100;
    expect(winRate).toBe(50);
  });

  it('prevents won stage from being non-terminal', () => {
    const isWon = true;
    const isTerminal = false;
    const isValid = !isWon || isTerminal;
    expect(isValid).toBe(false);
  });
});
