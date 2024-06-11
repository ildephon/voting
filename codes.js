
        
    const express = require('express');
    const bodyParser = require('body-parser');
    const mysql = require('mysql');
    
    const app = express();
    const PORT = process.env.PORT || 3306;
    
    app.use(bodyParser.urlencoded({ extended: false }));
    
    // Create a connection to the MySQL database
    const db = mysql.createConnection({
      host: 'bsdoik1kl4wgik01wjtr-mysql.services.clever-cloud.com',
      user: 'uqwtz4tgg9ew3jbm',
      password: 'JWZN28mJTGZTAyQYh2Md',
      database: 'bsdoik1kl4wgik01wjtr'
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
    let votes = {}; // Empty object to store vote counts (optional for display)
    
    // In-memory storage for user data (for simplicity)
    let userNames = {};
    let voters = new Set(); // Set to track phone numbers that have already voted
    let userLanguages = {}; // Object to store the language preference of each user
    
    async function getCandidates() {
      const query = 'SELECT name FROM candidates'; // Replace with your actual query
      try {
        const results = await db.query(query);
        return results.map(row => row.name); // Extract candidate names
      } catch (err) {
        console.error('Error fetching candidates:', err.stack);
        return []; // Handle errors by returning an empty array
      }
    }
    
    app.post('/ussd', async (req, res) => {
      let response = '';
    
      // Extract USSD input
      const { sessionId, serviceCode, phoneNumber, text } = req.body;
    
      // Parse user input
      const userInput = text.split('*').map(option => option.trim());
    
      // Determine next action based on user input
      if (userInput.length === 1 && userInput[0] === '') {
        // First level menu: Language selection
        response = `CON Welcome to ildephonse voting booth\n`;
        response += `1. English\n`;
        response += `2. kinyarwanda`;
      } else if (userInput.length === 1 && userInput[0] !== '') {
        // Save user's language choice and move to the name input menu
        userLanguages[phoneNumber] = userInput[0] === '1' ? 'en' : 'sw';
        response = userLanguages[phoneNumber] === 'en' ?
          `CON Please enter your name:` :
          `CON andika izina ryawe:`;
      } else if (userInput.length === 2) {
        // Save user's name
        userNames[phoneNumber] = userInput[1];
    
        // Third level menu: Main menu
        response = userLanguages[phoneNumber] === 'en' ?
          `CON Hi ${userNames[phoneNumber]}, choose an option:\n1. Vote Candidate\n2. View Votes` :
          `CON Amakuru ${userNames[phoneNumber]}, hitamo:\n1. umukandida\n2. reba amajwi yabatowe`;
      } else if (userInput.length === 3) {
        if (userInput[2] === '1') {
          // Check if the phone number has already voted... (existing logic)
    
          // Voting option selected
          const candidates = await getCandidates();
          response = userLanguages[phoneNumber] === 'en' ?
            `CON Select a candidate:\n` :
            `CON hitamo umukandida:\n`;
          candidates.forEach((candidate, index) => {
            response += `${index + 1}. ${candidate}\n`;
          });
        } else if (userInput[2] === '2') {
          // View votes option selected
          response = userLanguages[phoneNumber] === 'en' ?
            `END Votes:\n` :
            `END tora:\n`;
          for (let candidate in votes) {
            response += `${candidate}: ${votes[candidate]} votes\n`;
          }
        }
      
     else if (userInput.length === 4) {
        // Fourth level menu: Voting confirmation
        let candidateIndex = parseInt(userInput[3]) - 1;
        let candidateNames = Object.keys(votes);
        if (candidateIndex >= 0 && candidateIndex < candidateNames.length) {
            votes[candidateNames[candidateIndex]] += 1;
            voters.add(phoneNumber); // Mark this phone number as having voted
            response = userLanguages[phoneNumber] === 'en' ? 
                `END Thank you for voting for ${candidateNames[candidateIndex]}!` : 
                `END urakoze gutora ${candidateNames[candidateIndex]}!`;

            // Insert voting record into the database
            const voteData = {
                session_id: sessionId,
                phone_number: phoneNumber,
                user_name: userNames[phoneNumber],
                language_used: userLanguages[phoneNumber],
                voted_candidate: candidateNames[candidateIndex]
            };

            const query = 'INSERT INTO votes SET ?';
            db.query(query, voteData, (err, result) => {
                if (err) {
                    console.error('Error inserting data into database:', err.stack);
                }
            });
        } else {
            response = userLanguages[phoneNumber] === 'en' ? 
                `END Invalid selection. Please try again.` : 
                `END uhisemo ibitaribyo. ongera ugerageze.`;
        }
    }

    res.send(response);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
