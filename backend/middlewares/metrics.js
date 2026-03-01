// metrics.middleware.js
// Metrics tracking middleware for Express

const metrics = {
    startTime: Date.now(),
    requestCount: 0,
    responseTimes: [],
    endpoints: {},
    statusCodes: {
        '2xx': 0,
        '3xx': 0,
        '4xx': 0,
        '5xx': 0
    }
};

// Middleware to track request metrics
export const trackMetrics = (req, res, next) => {
    const startTime = Date.now();
    
    // Increment request count
    metrics.requestCount++;
    
    // Track endpoint-specific metrics
    const endpoint = `${req.method} ${req.path}`;
    if (!metrics.endpoints[endpoint]) {
        metrics.endpoints[endpoint] = {
            count: 0,
            responseTimes: [],
            lastAccessed: null
        };
    }
    metrics.endpoints[endpoint].count++;
    metrics.endpoints[endpoint].lastAccessed = new Date().toISOString();
    
    // Track response time and status code when request finishes
    res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        
        // Store last 100 response times for average calculation
        metrics.responseTimes.push(responseTime);
        if (metrics.responseTimes.length > 100) {
            metrics.responseTimes.shift();
        }
        
        metrics.endpoints[endpoint].responseTimes.push(responseTime);
        if (metrics.endpoints[endpoint].responseTimes.length > 100) {
            metrics.endpoints[endpoint].responseTimes.shift();
        }

        // Track status codes
        const statusCategory = `${Math.floor(res.statusCode / 100)}xx`;
        if (metrics.statusCodes[statusCategory] !== undefined) {
            metrics.statusCodes[statusCategory]++;
        }
    });
    
    next();
};

// Helper Functions
export function getUptimePercentage() {
    // In production, integrate with monitoring service
    // For now, assume 100% if server is running
    return 100;
}

export function getAverageResponseTime() {
    if (metrics.responseTimes.length === 0) return 0;
    const sum = metrics.responseTimes.reduce((a, b) => a + b, 0);
    return Math.round(sum / metrics.responseTimes.length);
}

export function getUptime() {
    const uptimeMs = Date.now() - metrics.startTime;
    const seconds = Math.floor(uptimeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    return {
        ms: uptimeMs,
        seconds,
        minutes,
        hours,
        days,
        formatted: (() => {
            if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
            if (hours > 0) return `${hours}h ${minutes % 60}m`;
            if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
            return `${seconds}s`;
        })()
    };
}

export function getMetricsData() {
    const uptime = getUptime();
    
    return {
        uptime: {
            percentage: getUptimePercentage(),
            duration: uptime.formatted,
            milliseconds: uptime.ms,
            startTime: new Date(metrics.startTime).toISOString(),
            currentTime: new Date().toISOString()
        },
        requests: {
            total: metrics.requestCount,
            averageResponseTime: getAverageResponseTime(),
            statusCodes: metrics.statusCodes
        },
        endpoints: Object.entries(metrics.endpoints)
            .map(([endpoint, data]) => {
                const avgTime = data.responseTimes.length > 0
                    ? Math.round(data.responseTimes.reduce((a, b) => a + b, 0) / data.responseTimes.length)
                    : 0;
                return {
                    endpoint,
                    count: data.count,
                    averageResponseTime: avgTime,
                    lastAccessed: data.lastAccessed
                };
            })
            .sort((a, b) => b.count - a.count) // Sort by most accessed
    };
}

export function resetMetrics() {
    metrics.requestCount = 0;
    metrics.responseTimes = [];
    metrics.endpoints = {};
    metrics.statusCodes = {
        '2xx': 0,
        '3xx': 0,
        '4xx': 0,
        '5xx': 0
    };
    // Keep startTime to maintain uptime tracking
}