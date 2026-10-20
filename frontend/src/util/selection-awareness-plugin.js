import { Plugin, PluginKey } from 'prosemirror-state';

export function selectionAwarenessPlugin(awareness) {
    return new Plugin({
        key: new PluginKey('selection-awareness'),
        view(view) {
            return {
                update(view) {
                    const { anchor, head } = view.state.selection;
                    awareness.setLocalStateField('cursor', { anchor, head });
                },
            };
        },
    });
}
