export const updateVersionDetails = async (req, res) => {
    const { title, desciption } = req.body;
    if (!title || !desciption) return res.status(400).json({ error: 'Missing required fields' });
    try {
    } catch (error) {
        console.error('Error saving version:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
    console.log(req.body);
    return res.status(200).json({ success: true });
};
