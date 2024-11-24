const cors = require("cors");
const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const mongoose = require("mongoose");
var bodyParser = require("body-parser");
const morgan = require("morgan");
const dotenv = require("dotenv");
const fileUpload = require('express-fileupload');
dotenv.config();

const Types = require("./models/Types.model");

app.use(fileUpload());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.set("view engine", "ejs");
// app.use(express.static('public'));

app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());
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







app.listen(8000, () => {
    console.log("Server is running http://localhost:8000 ");
});


// const newTypes = new Types({
//     name_type: "Electronic",
//     description: "Music created primarily using electronic devices like synthesizers and drum machines."
// })

// newTypes.save();