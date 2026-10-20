export const getWordCountFromYdoc = (ydoc) => {
    try {
        const yText = ydoc.getXmlFragment('default');

        const content = yText.toString();

        const words = content.trim().split(/\s+/);
        const filteredWords = words.filter((word) => word.length > 0);

        return filteredWords.length;
    } catch (err) {
        console.error('Error getting word count:', err);
        return 0;
    }
};
