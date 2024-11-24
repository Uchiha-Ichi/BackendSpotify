const { Accounts } = require("../models/Accounts.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const { uploadSong, uploadIMG } = require("../driveApi.js");
const authController = {
    registerAccount: async (req, res) => {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, salt);
            // let imgDefault = null;
            // const img = avPath ? avPath : imgDefault;
            // const uploadedIMG = fs.createReadStream(img);
            // const driveLinkIMG = await uploadIMG(uploadedIMG, name_song);
            // console.log('Drive link:', driveLink);
            // if (!driveLinkIMG) {
            //     return res.status(500).json({ error: "Không thể upload ảnh lên Google Drive." });
            // }
            console.log(hashed);
            const newAccount = await new Accounts({
                email: req.body.email,
                avatar: null,
                account_name: req.body.account_name,
                password: hashed,
                create_date: new Date(),
                admin: true
            });

            const account = await newAccount.save();
            const accessToken = authController.generrateAccessToken(account);
            const refreshToken = authController.generateRefreshToken(account);
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: false,
                path: "/",
                sameSite: "strict",
            });
            res.status(200).json(account, accessToken, refreshToken);
        } catch (err) {
            if (err.code === 11000) {
                res.status(400).json({ error: "Email already exists!" });
            } else {
                res.status(500).json({ error: "An error occurred" });
            }
        }
    },

    generrateAccessToken: (account) => {
        return jwt.sign({
            id: account.id,
            admin: account.admin,

        },
            process.env.JWT_ACCESS_KEY,
            { expiresIn: '30s' }
        );
    },
    generateRefreshToken: (account) => {
        return jwt.sign({
            id: account.id,
            admin: account.admin,

        },
            process.env.JWT_REFRESH_KEY,
            { expiresIn: '24h' }
        );
    },



    loginAccount: async (req, res) => {
        try {
            console.log(req.body);
            const account = await Accounts.findOne({ email: req.body.email });

            if (!account) {
                res.status(404).json("Incorrect username");
            }
            const validPassword = await bcrypt.compare(req.body.password, account.password);

            if (!validPassword) {
                res.status(404).json("Incorrect password");
            }
            if (account && validPassword) {
                const accessToken = authController.generrateAccessToken(account);
                const refreshToken = authController.generateRefreshToken(account);
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: false,
                    path: "/",
                    sameSite: "strict",
                });
                const { password, ...others } = account._doc;
                res.status(200).json({ ...others, accessToken, refreshToken });
            }
        } catch (err) {
            console.error("Error in registerAccount:", err);
            res.status(500).json(err);
        }
    },
    logoutAccount: async (req, res) => {
        res.clearCookie("refreshToken");
        res.status(200).json("Logged out successfully!");
    },

    requestRefreshToken: async (req, res) => {
        const refreshToken = req.cookie.refreshToken;
        if (!refreshToken) return res.status(401).json("you are not autheticated");
        jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, account) => {
            if (err) {
                console.log(err);

            }
            const newAccessToken = authController.generrateAccessToken(account);
            const newRefreshToken = authController.generateRefreshToken(account);
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: false,
                path: "/",
                sameSiteOnly: "strict",
            });
            res.status(200).json({ accessToken: newAccessToken });
        })
    },
    editAccount_name: async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ error: "No refresh token provided." });
            }
            jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, async (err, account) => {
                if (err) {
                    return res.status(403).json({ error: "Invalid refresh token." });
                }
                const { user_name } = req.body;
                const updatedAccount = await Account.findOneAndUpdate({ _id: account._id },
                    { $set: { account_name: user_name } },
                    { new: true, runValidators: true });
                if (!updatedAccount) {
                    return res.status(404).json({ error: "Song not found" });
                }

                res.status(200).json({ message: "Song updated successfully", data: updatedAccount });
            }
            );
        } catch (err) {
            res.status(500).json(err);
        }
    },
    editAccount_avata: async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ error: "No refresh token provided." });
            }
            jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, async (err, account) => {
                if (err) {
                    return res.status(403).json({ error: "Invalid refresh token." });
                }
                const { img } = req.body;
                const uploadedIMG = fs.createReadStream(img);
                const driveLinkIMG = await uploadIMG(uploadedIMG, name_song);
                if (!driveLinkIMG) {
                    return res.status(500).json({ error: "Không thể upload ảnh lên Google Drive." });
                }
                const updatedAccount = await Account.findOneAndUpdate({ _id: account._id },
                    { $set: { avatar: driveLinkIMG } },
                    { new: true, runValidators: true });
                if (!updatedAccount) {
                    return res.status(404).json({ error: "edit avatar fail" });
                }

                res.status(200).json({ message: "Account avatar updated successfully", data: updatedAccount });
            }
            );
        } catch (err) {
            res.status(500).json(err);
        }
    },
    editAccount_password: async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ error: "No refresh token provided." });
            }
            jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, async (err, account) => {
                if (err) {
                    return res.status(403).json({ error: "Invalid refresh token." });
                }
                const validPassword = await bcrypt.compare(req.body.password, account.password);

                if (!validPassword) {
                    res.status(404).json("Incorrect password");
                }
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash(req.body.newPassword, salt);
                const updatedAccount = await Account.findOneAndUpdate({ _id: account._id },
                    { $set: { password: hashed } },
                    { new: true, runValidators: true });
                if (!updatedAccount) {
                    return res.status(404).json({ error: "edit password fail" });
                }

                res.status(200).json({ message: "Account password updated successfully", data: updatedAccount });
            }
            );
        } catch (err) {
            res.status(500).json(err);
        }
    }
};

module.exports = authController;