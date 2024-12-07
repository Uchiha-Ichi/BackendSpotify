const express = require('express');
const router = express.Router();

router.get('/get_emotions', async (req, res) => {
    const query = req.body.sentence;
    if (!query) {
        return res.status(400).json({ error: "Text is required" });
    }

    try {
        // Gửi request đến FastAPI
        const response = await axios.post("http://localhost:8000/v1/get_emotions/", {
            sentence: query,
        });

        // Trả lại kết quả từ FastAPI
        return res.status(200).json(response.data);
    } catch (error) {
        console.error("Error calling FastAPI:", error.message);
        return res.status(500).json({ error: "Failed to fetch prediction" });
    }
})