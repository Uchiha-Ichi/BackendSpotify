const { google } = require("googleapis");
const { Readable } = require("stream");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({ version: "v3", auth: oauth2Client });
const FOLDER_SONG = process.env.FOLDER_SONG;
const FOLDER_IMG = process.env.FOLDER_IMG;

function bufferToStream(buffer) {
    if (!Buffer.isBuffer(buffer)) {
        throw new TypeError("The provided input is not a valid Buffer.");
    }
    return Readable.from(buffer);
}

async function uploadSong(file, filename) {
    // Metadata của file
    let fileMetaData = {
        'name': filename + ".mp3",
        'parents': [FOLDER_SONG],
    };
    // Nội dung file
    let media = {
        mimeType: 'audio/mpeg',
        body: bufferToStream(file.data),
    };

    try {

        const response = await drive.files.create({
            resource: fileMetaData,
            media: media,
            fields: 'id',
        });

        if (response.status === 200) {
            const fileId = response.data.id;

            await drive.permissions.create({
                fileId: fileId,
                requestBody: {
                    role: 'reader',
                    type: 'anyone',
                },
            });

            const downloadLink = `https://drive.google.com/uc?export=download&id=${fileId}`;
            console.log("File đã upload:", downloadLink);

            return downloadLink;
        } else {
            console.error("Lỗi upload:", response.status);
            return false;
        }
    } catch (error) {
        console.error("Exception khi upload file:", error);
        return false;
    }
};

async function uploadIMG(file, filename) {
    // Metadata của file
    let fileMetaData = {
        name: filename + ".jpg",
        parents: [FOLDER_IMG],
    };

    // Nội dung file
    let media = {
        mimeType: file.mimetype || 'image/jpeg',
        body: bufferToStream(file.data),
    };

    try {

        const response = await drive.files.create({
            resource: fileMetaData,
            media: media,
            fields: 'id',
        });

        if (response.status === 200) {
            const fileId = response.data.id;

            await drive.permissions.create({
                fileId: fileId,
                requestBody: {
                    role: 'reader',
                    type: 'anyone',
                },
            });

            const viewLink = `https://drive.google.com/uc?export=download&id=${fileId}`;
            console.log("Ảnh đã upload:", viewLink);

            return viewLink;
        } else {
            console.error("Lỗi upload:", response.status);
            return false;
        }
    } catch (error) {
        console.error("Exception khi upload ảnh:", error);
        return false;
    }
};

module.exports = { uploadSong, uploadIMG };
