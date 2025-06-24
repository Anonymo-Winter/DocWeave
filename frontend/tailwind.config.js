// tailwind.config.js

export default {
    darkMode: 'class',
    content: ['./src/**/*.{js,ts,jsx,tsx,css}'],
    safelist: [
        {
            pattern:
                /bg-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-100/,
        },
        {
            pattern:
                /text-(black|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-700/,
        },
        {
            pattern:
                /dark:text-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-700/,
        },
        {
            pattern:
                /border-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-500/,
        },
        {
            pattern:
                /ring-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-500/,
        },
        {
            pattern:
                /ring-offset-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-200/,
        },
    ],
    plugins: [],
    extend: {
        colors: {
            popover: 'hsl(var(--popover))',
            'popover-foreground': 'hsl(var(--popover-foreground))',
            border: 'hsl(var(--border))',
        },
    },
};
