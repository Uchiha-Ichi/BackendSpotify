const { Accounts } = require("../models/Accounts.model");
const Songs = require("../models/Songs.model");


const searchController = {
    search: async (req, res) => {
        const { key } = req.body;

        if (!key) {
            return res.status(400).json({ message: "No search key provided" });
        }
        console.log(key);
        try {
            const regex = new RegExp(key, "i");
            const songResults = await Songs.find({ name_song: { $regex: regex } }).lean();
            const accountResults = await Accounts.find({ account_name: { $regex: regex }, admin: true }).lean();

            const results = {
                songs: songResults.length > 0 ? songResults : "",
                accounts: accountResults.length > 0 ? accountResults : "",
            };
            console.log("Tất cả tài khoản trong DB:", results);
            if (Object.keys(results).length === 0) {
                return res.status(404).json({ message: "Không tìm thấy kết quả nào." });
            }
            return res.status(200).json({ results });
        } catch (err) {
            console.error("Error during search:", err);
            return res.status(500).json({ message: "Server error" });
        }
    },
};

module.exports = searchController;
