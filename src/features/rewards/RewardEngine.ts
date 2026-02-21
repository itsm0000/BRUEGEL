/**
 * RewardEngine — Determines the type of reward on level completion.
 * 
 * Uses weighted random chance:
 * - 70% Standard celebration
 * - 20% Bonus star (extra star animation)
 * - 10% Jackpot (double confetti + golden + special fanfare)
 */

export type RewardType = 'standard' | 'bonus' | 'jackpot';

export interface RewardResult {
    type: RewardType;
    confettiMultiplier: number;
    extraShake: number;
    message: string;
}

const REWARD_TABLE: { type: RewardType; weight: number; confettiMultiplier: number; extraShake: number; message: string }[] = [
    { type: 'standard', weight: 70, confettiMultiplier: 1, extraShake: 0, message: '' },
    { type: 'bonus', weight: 20, confettiMultiplier: 1.5, extraShake: 0.2, message: '⭐ Bonus Star!' },
    { type: 'jackpot', weight: 10, confettiMultiplier: 2, extraShake: 0.5, message: '🎰 JACKPOT!' },
];

/**
 * Roll a random reward based on the weighted table.
 * The distribution is deterministic given a uniform random input.
 */
export function rollReward(): RewardResult {
    const roll = Math.random() * 100;
    let cumulative = 0;

    for (const entry of REWARD_TABLE) {
        cumulative += entry.weight;
        if (roll < cumulative) {
            return {
                type: entry.type,
                confettiMultiplier: entry.confettiMultiplier,
                extraShake: entry.extraShake,
                message: entry.message,
            };
        }
    }

    // Fallback (should never reach)
    return { type: 'standard', confettiMultiplier: 1, extraShake: 0, message: '' };
}
