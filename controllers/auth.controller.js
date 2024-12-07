const { Accounts } = require("../models/Accounts.model");
const bcrypt = require("bcrypt");
const path = require('path');
const fs = require('fs');
const jwt = require("jsonwebtoken");
// const { uploadSong, uploadIMG } = require("../driveApi.js");
const authController = {
    getAllArtist: async (req, res) => {
        try {
            const artist = await Accounts.find({ admin: true });
            // .sort({ create_date: -1 })
            return res.status(200).json(artist);
        } catch (err) {
            return res.status(500).json(err);
        }
    },
    getArtistById: async (req, res) => {
        const artist = await Accounts.find({ id: req.params.id });
        return res.status(200).json(artist);
    },
    registerAccount: async (req, res) => {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, salt);

            const email = req.body.email;
            const account_name = req.body.account_name;

            const newAccount = await new Accounts({
                email: email,
                avatar: null,
                account_name: account_name,
                password: hashed,
                create_date: new Date(),
                admin: true
            });

            const account = await newAccount.save();
            const imagePath = path.join(__dirname, '..', '..', 'frontend', 'public', 'assets', 'img', 'daunguoi.png');
            const imagesDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'images');

            const account_id = account._id.toString();
            const destinationPath = path.join(imagesDir, `${account_id}.jpg`);
            fs.copyFile(imagePath, destinationPath, (err) => {
                if (err) {
                    return res.status(500).send(err);
                }
            });
            return res.status(200).json();
        } catch (err) {
            if (err.code === 11000) {
                return res.status(400).json({ error: "Email already exists!" });
            } else {
                return res.status(500).json({ error: "An error occurred" });
            }
        }
    },

    generrateAccessToken: (account) => {
        return jwt.sign({
            id: account.id,
            admin: account.admin,

        },
            process.env.JWT_ACCESS_KEY,
            { expiresIn: '1h' }
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
                return res.status(404).json("Incorrect username");
            }
            const validPassword = await bcrypt.compare(req.body.password, account.password);

            if (!validPassword) {
                return res.status(401).json("Incorrect password");
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
                return res.status(200).json({ ...others, accessToken, refreshToken });
            } else {
                return res.status(401).json("Incorrect username or password");
            }
        } catch (err) {
            console.error("Error in registerAccount:", err);
            return res.status(500).json(err);
        }
    },
    logoutAccount: async (req, res) => {
        res.clearCookie("refreshToken");
        return res.status(200).json("Logged out successfully!");
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
            return res.status(200).json({ accessToken: newAccessToken });
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
                const account_name = req.body.newName;
                const updatedAccount = await Accounts.findOneAndUpdate({ _id: account.id },
                    { $set: { account_name: account_name } },
                    { new: true, runValidators: true });
                if (!updatedAccount) {
                    return res.status(404).json({ error: "Account not found" });
                }
                const accessToken = authController.generrateAccessToken(account);
                const refreshToken = authController.generateRefreshToken(account);
                return res.status(200).json(updatedAccount, accessToken, refreshToken);
            }
            );
        } catch (err) {
            return res.status(500).json(err);
        }
    },
    editAccount_avatar: async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ error: "No refresh token provided." });
            }
            jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, async (err, account) => {
                if (err) {
                    return res.status(403).json({ error: "Invalid refresh token." });
                }
                const imgPath = req.files.imgPath;
                const id_account = account.id.toString();
                const imagesDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'images');
                const imagePath = path.join(imagesDir, `${id_account}.jpg`);
                if (fs.existsSync(imagePath)) {
                    fs.unlink(imagePath, (err) => {
                        if (err) {
                            console.error("Error deleting image:", err);
                            return;
                        }
                    });
                }
                imgPath.mv(imagePath, (err) => {
                    if (err) {
                        return res.status(500).send(err);
                    }
                });

                return res.status(200).json();
            }
            );
        } catch (err) {
            return res.status(500).json(err);
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
                const newPassword = req.body.newPassword;
                const validPassword = await bcrypt.compare(newPassword, account.password);

                if (validPassword) {
                    return res.status(404).json("Incorrect password");
                }
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash(newPassword, salt);
                const updatedAccount = await Accounts.findOneAndUpdate({ _id: account.id },
                    { $set: { password: hashed } },
                    { new: true, runValidators: true });
                if (!updatedAccount) {
                    return res.status(404).json({ error: "edit password fail" });
                }
                const accessToken = authController.generrateAccessToken(account);

                return res.status(200).json(updatedAccount, accessToken, refreshToken);
            }
            );
        } catch (err) {
            return res.status(500).json(err);
        }
    }
};

module.exports = authController;