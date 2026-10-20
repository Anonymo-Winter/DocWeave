// Convert AI-generated text into HTML with real paragraph nodes.
//
// A ProseMirror text node can't contain newline characters, so inserting raw
// "\n"/"\n\n" as a plain string makes the breaks render once but collapse into a
// single paragraph the moment the document re-renders (e.g. on the next edit).
// Splitting into <p> blocks (with <br> for single newlines) gives the editor a
// proper structure that survives editing.

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const aiTextToHtml = (text) =>
    String(text || '')
        .replace(/\r\n/g, '\n')
        .split(/\n{2,}/)
        .map((block) => block.trim())
        .filter(Boolean)
        .map((block) => `<p>${escapeHtml(block).replace(/\n/g, '<br>')}</p>`)
        .join('');
