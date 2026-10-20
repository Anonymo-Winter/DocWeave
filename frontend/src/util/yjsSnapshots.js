import * as Y from 'yjs';

export function createNamedSnapshot(ydoc, name, author) {
    const snapshot = Y.snapshot(ydoc);
    const encodedSnapshot = Y.encodeSnapshot(snapshot);

    return {
        name,
        timestamp: new Date().toISOString(),
        snapshot: encodedSnapshot,
        author, // { id: user._id, name: user.name }
    };
}

export function applySnapshotToDoc(ydoc, encodedSnapshot) {
    const snapshot = Y.decodeSnapshot(encodedSnapshot);
    const fragment = ydoc.getXmlFragment('default');

    // 🚨 Clear current document
    fragment.delete(0, fragment.length);

    // ⚠️ Manually restore content from the snapshot using a separate doc
    const snapshotDoc = new Y.Doc();
    const restoredFragment = snapshotDoc.getXmlFragment('default');

    // Apply snapshot to the snapshotDoc
    Y.applyUpdate(snapshotDoc, Y.encodeStateAsUpdate(ydoc)); // merge base state
    snapshotDoc.transact(() => {
        Y.snapshot.applySnapshot(snapshotDoc, snapshot); // 👈 this is private/internal but works
    });

    // Copy content from restoredFragment to original ydoc
    restoredFragment.toArray().forEach((node) => {
        fragment.push([node.clone()]);
    });
}
