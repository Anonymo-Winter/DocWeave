import OpenAI from 'openai';
if (!process.env.GROQ_API_KEY) {
    console.warn('[ai] GROQ_API_KEY not set - AI features disabled');
}

export const ai = new OpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
});

export const MODELS = {
    chat: 'llama-3.3-70b-versatile',
    embed: null, // Groq doesn't ship embeddings; not needed for current features
};

// import OpenAI from 'openai';

// if (!process.env.GOOGLE_API_KEY) {
//     console.warn('[ai] Google API Key not set - AI features disabled');
// }

// export const ai = new OpenAI({
//     baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
//     apiKey: process.env.GOOGLE_API_KEY,
// });

// export const MODELS = {
//     chat: 'gemini-2.5-flash',
//     embed: 'text-embedding-004',
// };
