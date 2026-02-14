import { useState } from 'react';
import { Tier, Level } from '~types/level';

// In a real app, this could be an API call or dynamic import
// For now, we wrap the static data to simulate the async definition structure
import { TIERS } from '@/data/tiers';

export const useLevelLoader = () => {
    // Optimization: Load static data immediately. 
    // If we move to API later, we can revert to async.
    const [isLoading] = useState(false);
    const [tiers] = useState<Tier[]>(TIERS);

    const getLevelsForSubTier = (tierId: number, subTierId: string): Level[] => {
        const tier = tiers.find(t => t.id === tierId);
        if (!tier) return [];
        const sub = tier.subTiers.find(st => st.id === subTierId);
        return sub ? sub.levels : [];
    };

    const getFlatLevels = (): Level[] => {
        return tiers.flatMap(t => t.subTiers.flatMap(st => st.levels));
    };

    return {
        isLoading,
        tiers,
        getLevelsForSubTier,
        getFlatLevels
    };
};
