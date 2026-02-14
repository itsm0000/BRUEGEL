import React, { useState, useEffect, useCallback } from 'react';

// Global listener for announcements
let announcer: ((message: string, politeness?: 'polite' | 'assertive') => void) | null = null;

export const announce = (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    if (announcer) {
        announcer(message, politeness);
    }
};

export const A11yAnnouncer: React.FC = () => {
    const [message, setMessage] = useState('');
    const [politeness, setPoliteness] = useState<'polite' | 'assertive'>('polite');

    const handleAnnounce = useCallback((msg: string, p: 'polite' | 'assertive' = 'polite') => {
        setPoliteness(p);
        setMessage(msg);
        // Clear after delay to allow re-announcement of same message if needed
        setTimeout(() => setMessage(''), 1000); // 1s
    }, []);

    useEffect(() => {
        announcer = handleAnnounce;
        return () => {
            announcer = null;
        };
    }, [handleAnnounce]);

    return (
        <div
            role="status"
            aria-live={politeness}
            className="sr-only"
        >
            {message}
        </div>
    );
};
