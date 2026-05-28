import { ai, MODELS } from '../client.js';

const REWRITE_SYSTEM = `You are an editing assistant inside a collaborative document.
You receive a passage and an instruction.
Return ONLY the rewritten passage — no quotes, no prefaces, no commentary.
Preserve meaning unless the instruction says otherwise.
Match the tone of the surrounding document.`;

const TONE_NOTES = {
    professional: 'Use a professional, polished business tone. Clear, confident, no slang.',
    casual: 'Use a casual, conversational tone. Plain language, contractions are fine.',
    formal: 'Use a formal academic tone. Precise vocabulary, no contractions, no slang.',
    friendly: 'Use a warm, friendly tone. Approachable and human, without losing professionalism.',
    confident: 'Use a confident, assertive tone. Direct statements, no hedging.',
};

export async function* rewriteStream({ selection, instruction, docContext = '', tone = null }) {
    const toneLine = tone && TONE_NOTES[tone] ? `\nTone: ${TONE_NOTES[tone]}` : '';

    const stream = await ai.chat.completions.create({
        model: MODELS.chat,
        temperature: 0.4,
        stream: true,
        messages: [
            { role: 'system', content: REWRITE_SYSTEM + toneLine },
            ...(docContext ? [{ role: 'user', content: `Surrounding context :\n${docContext}` }] : []),
            { role: 'user', content: `Instruction: ${instruction}\n\nPassage:\n${selection}` },
        ],
    });

    for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) yield delta;
    }
}
