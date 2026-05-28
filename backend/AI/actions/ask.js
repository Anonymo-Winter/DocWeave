import { ai, MODELS } from '../client.js';

const ASK_SYSTEM = `You are an assistant that answers questions about a specific document.
You will be given the entire document contents followed by a question.

Rules:
- Base every answer on the document. If the document doesn't contain the answer, say so plainly and don't invent details.
- Be concise by default. Expand only when the question explicitly asks for detail.
- Quote short phrases from the document when they support your answer.
- Use plain text. No Markdown headings or bold.`;

/**
 * Streams an answer to a question about the given document text.
 * Designed for Gemini's large context window — passes the whole doc.
 *
 * @param {{ documentText: string, question: string, history?: Array<{role,content}> }} opts
 */
export async function* askStream({ documentText, question, history = [] }) {
    const docContextMessage = {
        role: 'user',
        content: `Document:\n\n${documentText || '(empty document)'}\n\n---\nUse the document above to answer the next question.`,
    };

    const stream = await ai.chat.completions.create({
        model: MODELS.chat,
        temperature: 0.3,
        stream: true,
        messages: [
            { role: 'system', content: ASK_SYSTEM },
            docContextMessage,
            ...history.slice(-8), // last few Q/A turns for follow-ups
            { role: 'user', content: question },
        ],
    });

    for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) yield delta;
    }
}
