const express = require('express');
const path = require('path');
const app = express();
const moment = require('moment');
const mysql = require('mysql');
const axios = require('axios');		// apparently needed for Flask
const PORT = process.env.PORT || 5000;
const logger = (req, res, next) => {
	console.log(`${req.protocol}://${req.get('host')}${req.originalUrl}:${moment().format()}`);
	next();
}

/*
// used for console output
app.use(logger);
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.listen(PORT, () =>	{
	console.log(`server is started in port ${PORT}`);
})*/

// Middleware
app.use(express.json()); // allow JSON body
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // serve public folder

app.get("/", (req,res) => {
	res.redirect("/login.html");
});

// MySQL connection
const sqlcon = mysql.createConnection({
    host: "localhost",
    user: "root",       // change if needed
    password: "",       // change if needed   
    database: "accdb"  // make sure DB exists
});

sqlcon.connect(err => {
    if (err) throw err;
    console.log("MySQL Connected...");
});

// Login
app.post("/api/login", (req, res) => {
    const { user, pass } = req.body;
    sqlcon.query(
        "SELECT * FROM login WHERE username=? AND password=?",
        [user, pass],
        (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
                res.json({ success: true, redirect: "/display.html" });
				//res.json({ success: true, message: "Login successful" });
            } else {
                res.json({ success: false, message: "Invalid credentials" });
            }
        }
    );
});

// Display
app.get("/api/getaccs", (req, res) => {
    sqlcon.query(
        "SELECT * FROM accounts",
        (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
                res.json({ success: true, data: result });
			} else {
				res.json({ success: false, message: "No entries found" });
			}
		}
    );
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// Create
app.post('/api/createEntry', (req, res) => {
	const { site, user, pass } = req.body;
	const sql = "INSERT INTO accounts (site, username, password) VALUES (?, ?, ?)";
	
	sqlcon.query(sql, [site, user, pass], (err, rows, field) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ msg: "Database error" });
		}
		res.json({ msg: "New account was successfully saved." });
	});
});

// Delete
app.delete('/api/deleteEntry', (req, res) => {
	const { site, user } = req.body;  
	const sql = "DELETE FROM accounts WHERE site = ? && username = ?";
    sqlcon.query(sql, [site, user], (err, rows, field) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ msg: "Database error" });
		}
		res.json({ msg: "Account was successfully deleted." });
    });
});

// Update
app.put('/api/updateEntry', (req, res) => {
	const { site, user, pass } = req.body;  
	const sql = "UPDATE accounts SET site = ?, username = ?, password = ? WHERE site = ? && username = ?";


	sqlcon.query(sql, [site, user, pass, site, user], (err, rows, field) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ msg: "Database error" });
		}
		res.json({msg: `Student was successfully updated.`});
    });
});