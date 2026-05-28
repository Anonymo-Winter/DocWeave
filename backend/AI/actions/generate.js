import { ai, MODELS } from '../client.js';

const GENERATE_SYSTEM = `You are a writing assistant working inside a collaborative document editor.
You receive an instruction describing what to write, and (optionally) the surrounding document for tone reference.
Generate the requested content as clean prose or a list, following the instruction precisely.

Rules:
- Return ONLY the generated content — no quotes, no prefaces, no commentary, no "Here is..." preambles.
- Match the tone, voice, and formality of the surrounding document when context is provided.
- If the instruction asks for a list, use "- " bullet markers, one item per line.
- If the instruction asks for headings, write them on their own line with a leading "# " or "## ".
- Keep paragraphs reasonably short. Use blank lines to separate paragraphs.
- Do not output Markdown bold/italic syntax — write plainly.
- IMPORTANT: If the instruction is to summarize, continue, analyze, or otherwise operate on the existing document, and the existing document is empty or trivially short, respond with ONE short line stating that there is nothing to work with — do NOT invent content. Example: "(The document is empty — nothing to summarize.)"`;

export async function* generateStream({ instruction, docContext = '' }) {
    const stream = await ai.chat.completions.create({
        model: MODELS.chat,
        temperature: 0.6,
        stream: true,
        messages: [
            { role: 'system', content: GENERATE_SYSTEM },
            ...(docContext
                ? [
                      {
                          role: 'user',
                          content: `Existing document (for tone reference only — do not rewrite it):\n\n${docContext}`,
                      },
                  ]
                : []),
            { role: 'user', content: `Instruction:\n${instruction}` },
        ],
    });

    for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) yield delta;
    }
}
