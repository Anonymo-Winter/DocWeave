export const getWordCountFromYdoc = (ydoc) => {
    try {
        const yText = ydoc.getText('prosemirror'); // or 'default' if using other key
        const content = yText.toString(); // get raw string content

        const words = content.trim().split(/\s+/); // split on any whitespace
        const filteredWords = words.filter((word) => word.length > 0); // remove empty

        return filteredWords.length;
    } catch (err) {
        console.error('Error getting word count:', err);
        return 0;
    }
};
