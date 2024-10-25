const config = require('config');
const PORT = config.get('PORT');
const url = config.get('MONGO_URL');
const mongoose = require('mongoose');
const express = require("express");
const path = require('path');

const userRoutes = require("./components/routes/userRoutes.js");
const doctorRoute = require('./components/routes/doctorRoute.js');
const appointmentRoute = require('./components/routes/appointmentRoute.js');
const supportTicket = require("./components/routes/supportTicket.js");
const createServer = require("./components/Utils/socketController.js");

const app = express();
const cors = require('cors');

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, '..', 'uploads')));

app.use(cors({ origin: '*' }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const {server, io} = createServer(app);

//All Routes 
app.use('', doctorRoute)
app.use('', userRoutes);
app.use('', appointmentRoute);
app.use('', supportTicket);

//DB Connection
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

//Server create
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
