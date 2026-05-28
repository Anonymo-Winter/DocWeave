/**
 * Tiny ref-style bridge so components outside the editor's component tree
 * (e.g. the EditorNavbar, which is a sibling) can reach the Tiptap editor
 * without a heavyweight context.
 *
 * Editor.jsx calls setEditor(editor) when the editor is ready and
 * setEditor(null) on unmount. Anyone who needs to apply commands imports
 * getEditor() and uses it.
 */

let activeEditor = null;

export function setEditor(editor) {
    activeEditor = editor;
}

export function getEditor() {
    return activeEditor;
}

/**
 * Lightweight registry so components like the slash-command menu (rendered
 * inside the editor) can trigger modals/panels owned by siblings (navbar,
 * page-level layout) without prop drilling.
 *
 * Owners call registerAIOpeners({ openAIGenerate, openAskPanel }) on mount
 * and registerAIOpeners({ openAIGenerate: null, ... }) on unmount.
 */
let openers = {};

export function registerAIOpeners(next) {
    openers = { ...openers, ...next };
}

export function openAIGenerate() {
    openers.openAIGenerate?.();
}

export function openAskPanel() {
    openers.openAskPanel?.();
}
