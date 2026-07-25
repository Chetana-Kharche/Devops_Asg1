const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

/* ================== DB CONNECT ================== */
mongoose.connect("mongodb://127.0.0.1:27017/vehicleDB")
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log(err));

/* ================== USER ================== */
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: String // admin or user
});

const User = mongoose.model("user", userSchema);

/* ================== BOOKING ================== */
const bookingSchema = new mongoose.Schema({
    name: String,
    phone: String,
    vehicle: String,
    address: String,
    date: String,
    time: String
});

const Booking = mongoose.model("booking", bookingSchema);

/* ================== CREATE ADMIN ================== */
app.get("/createAdmin", async (req, res) => {
    await User.create({
        username: "admin",
        password: "admin123",
        role: "admin"
    });
    res.send("Admin Created");
});

/* ================== HOME ================== */
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "home.html"));
});

/* ================== REGISTER (NEW) ================== */
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    // check if user exists
    const existing = await User.findOne({ username });
    if (existing) {
        return res.send("⚠️ User already exists");
    }

    await User.create({
        username,
        password,
        role: "user"
    });

    res.redirect("login.html");
});

/* ================== LOGIN (UPDATED) ================== */
app.post("/login", async (req, res) => {

    const { username, password } = req.body;

    // 👉 Admin login
    if (username === "admin" && password === "admin123") {
        return res.redirect("/admin.html");
    }

    // 👉 Check user in DB
    const user = await User.findOne({ username, password });

    if (user) {
        // ✅ send username to dashboard
        res.redirect(`/dashboard.html?user=${username}`);
    } else {
        res.send("❌ Invalid credentials");
    }
});

/* ================== BOOKING ================== */
app.post("/book", async (req, res) => {
    try {
        const { date, time } = req.body;

        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0,0,0,0);

        if (selectedDate <= today) {
            return res.send("❌ Select future date only");
        }

        const hour = parseInt(time.split(":")[0]);
        if (hour < 9 || hour >= 20) {
            return res.send("❌ Only 9AM–8PM allowed");
        }

        const exists = await Booking.findOne({ date, time });
        if (exists) {
            return res.send("❌ Slot already booked");
        }

        await new Booking(req.body).save();

        res.send(`
            <h2>✅ Booking Confirmed</h2>
            <a href="dashboard.html">Go Back</a>
        `);

    } catch (err) {
        res.send("❌ Error");
    }
});

/* ================== SLOTS ================== */
app.get("/slots", async (req, res) => {
    const data = await Booking.find({}, "date time -_id");
    res.json(data);
});

/* ================== ADMIN ================== */
app.get("/allBookings", async (req, res) => {
    const data = await Booking.find();
    res.json(data);
});

app.delete("/delete/:id", async (req, res) => {
    await Booking.findByIdAndDelete(req.params.id);
    res.send("Deleted");
});

/* ================== SERVER ================== */
app.listen(3000, () => {
    console.log("🚀 http://localhost:3000");
});