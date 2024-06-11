const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const PORT = process.env.PORT || 3306;

app.use(bodyParser.urlencoded({ extended: false }));

// Create a connection to the MySQL database
const db = mysql.createConnection({
    host: 'bizhdi2fnyjg9ady7rgz-mysql.services.clever-cloud.com',
    user: 'ueuwzb6hmvo3sack',
    password: 'NBpbV7Xqltd2oqbhGo2m', 
    database: 'bizhdi2fnyjg9ady7rgz'
});

// Connect to the database
db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to database.');
});

// In-memory storage for votes (for simplicity)
let votes = {
    "uwase c.": 0,
    "kenny N.": 0,
    "Jean Paul M.": 0,
    "eric U.": 0,
    "KAMANZI L.": 0
};

// In-memory storage for user data (for simplicity)
let userNames = {};
let voters = new Set(); // Set to track phone numbers that have already voted
let userLanguages = {}; // Object to store the language preference of each user

// Route to get the total votes of all candidates
app.get('/totalvotes', (req, res) => {
    let totalVotes = 0;
    for (let candidate in votes) {
        totalVotes += votes[candidate];
    }
    res.send(`Total votes: ${totalVotes}`);
});

app.post('/ussd', (req, res) => {
    // Your existing code for handling USSD requests
    // ...
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
