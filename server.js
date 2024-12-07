const cors = require("cors");
const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const mongoose = require("mongoose");
var bodyParser = require("body-parser");
const morgan = require("morgan");
const dotenv = require("dotenv");
const fileUpload = require('express-fileupload');
const session = require('express-session');
dotenv.config();

const Types = require("./models/Types.model");

// const typesToAdd = [
//     { name_type: "Sadness", description: "A state of unhappiness or sorrow." },
//     { name_type: "Joy", description: "A feeling of great pleasure and happiness." },
//     { name_type: "Love", description: "An intense feeling of deep affection." },
//     { name_type: "Anger", description: "A strong feeling of annoyance or displeasure." },
//     { name_type: "Fear", description: "An unpleasant emotion caused by the threat of danger." },
//     { name_type: "Surprise", description: "A feeling of astonishment caused by something unexpected." },
// ];
// async function addTypes() {
//     try {
//         for (const type of typesToAdd) {
//             await Types.findOneAndUpdate(
//                 { name_type: type.name_type },
//                 type,
//                 { upsert: true, new: true }
//             );
//         }

//         console.log('Types added successfully!');
//     } catch (err) {
//         console.error('Error adding types:', err);
//     }
// }

// addTypes();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(session({
    secret: process.env.SECRETKEY,  // Chọn một key bí mật cho session
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // Đặt là true khi sử dụng HTTPS trong môi trường sản xuất
}));
app.use(fileUpload({
    createParentPath: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.set("view engine", "ejs");
// app.use(express.static('public'));

app.use(bodyParser.json({ limit: "50mb" }));
app.use(morgan("common"));


const authRoute = require("./routes/auth.route");
app.use("/v1/auth", authRoute);
const homeRoute = require("./routes/home.route");
app.use("/", homeRoute);
const songRoute = require("./routes/song.route");
app.use("/api/song", songRoute);
const playListRoute = require("./routes/playlist.route");
app.use("/api/playlist", playListRoute);
const searchRoute = require("./routes/search.route");
app.use("/api/search", searchRoute);
const albumRoute = require("./routes/album.route");
app.use("/api/album", albumRoute);
const typeRoute = require("./routes/type.route");
app.use("/api/type", typeRoute);



//connect DB
async function connectDB() {
    try {
        await mongoose.connect((process.env.MONGODB_URL), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

connectDB();







app.listen(8888, () => {
    console.log("Server is running http://localhost:8888 ");
});


// const newTypes = new Types({
//     name_type: "Electronic",
//     description: "Music created primarily using electronic devices like synthesizers and drum machines."
// })

// newTypes.save();


// const axios = require("axios");

// axios.get("http://127.0.0.1:8000/v1/get_emotions/?sentence=I%20lost%20you")
//     .then((response) => {
//         console.log("Test connection to API 8000 succeeded:", response.data);
//     })
//     .catch((error) => {
//         console.error("Test connection to API 8000 failed:", error.message);
//     });