const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("http");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require("cors");
const uiClient = "http://localhost:8081";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: uiClient,
    methods: ["GET", "POST"]
  }
});
io.on("connection", (socket) => {
  console.log('connection established!!');
  socket.on("disconnect", () => {
    console.log("connection disconnected");
  });
  socket.on("drawing", (data) => {
    console.log('drawing data', data);
    socket.broadcast.emit("drawing", data);
  });
});


var corsOptions = {
  origin: uiClient
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json({ limit: '50mb' }));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/uploadedImages', express.static('uploadedImages'));

const db = require("./app/models");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

require('./app/routes/auth.routes')(app);
require('./app/routes/project.routes')(app);
require('./app/routes/board.routes')(app);

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploadedImages/');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

app.post('/uploadedImages', (req, res) => {
    console.log('uploading image!!');
    let upload = multer({ storage: storage }).single('file');

    upload(req, res, function(err) {

        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        }
        else if (!req.file) {
            return res.send('Please select an image to upload');
        }
        else if (err instanceof multer.MulterError) {
            return res.send(err);
        }
        else if (err) {
            return res.send(err);
        }
        res.send("successfully uploaded the image");
    });
});

app.get('/uploadedImagesList', (req, res) => {
  const directoryPath = path.join(__dirname, 'uploadedImages');
  console.log('directoryPath', directoryPath);
  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      return res.send(err);
    }
    res.send(files);
});
});

// set port, listen for requests
const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
