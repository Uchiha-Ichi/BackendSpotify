const Types = require('../models/Types.model');

const TypeController = {
    async getAllTypes(req, res) {
        try {
            const allTypes = await Types.find();
            return res.status(200).json(allTypes);
        }
        catch (err) {
            return res.status(500).json(err);
        }
    }
}

module.exports = TypeController;