import React from 'react';

export function useOfflineStatus() {
    const [isOnline, setIsOnline] = React.useState(navigator.onLine);

    React.useEffect(() => {
        const handler = () => setIsOnline(navigator.onLine);
        window.addEventListener('online', handler);
        window.addEventListener('offline', handler);
        return () => {
            window.removeEventListener('online', handler);
            window.removeEventListener('offline', handler);
        };
    }, []);

    return isOnline;
}
