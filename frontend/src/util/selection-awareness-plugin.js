import { Plugin, PluginKey } from 'prosemirror-state';

export function selectionAwarenessPlugin(awareness) {
    let lastAnchor = null;
    let lastHead = null;

    return new Plugin({
        key: new PluginKey('selection-awareness'),
        view(view) {
            return {
                update(view) {
                    const { anchor, head } = view.state.selection;

                    // Update only if selection changed
                    if (anchor !== lastAnchor || head !== lastHead) {
                        awareness.setLocalStateField('cursor', { anchor, head });
                        lastAnchor = anchor;
                        lastHead = head;
                    }
                },
            };
        },
    });
}
