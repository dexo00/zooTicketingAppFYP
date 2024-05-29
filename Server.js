const express = require('express');
const mysql = require('mysql2/promise'); // Use mysql2/promise for promise support
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');


/*
// Create a connection to the MySQL database
const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'zooiticket', // Change to your actual database name
});

const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'zooiticket', // Change to your actual database name
});

const connection = mysql.createPool({
  host: 'sql213.infinityfree.com',
  user: 'if0_36365632',
  password: 'nXEeU0aYQiP',
  database: 'if0_36365632_zoo', // Change to your actual database name
});

const connection = mysql.createConnection({
  host: 'sql308.infinityfree.com',
  user: 'if0_36407151',
  password: 'vyU0gsFPwKo',
  database: 'if0_36407151_zooiticket', // Change to your actual database name
});
*/


const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'zooiticket', // Change to your actual database name
});

const app = express();

// Use body-parser middleware to parse JSON and URL-encoded data
app.use(bodyParser.json({ limit: '8mb' })); 
app.use(bodyParser.urlencoded({ extended: true, limit: '8mb' }));

app.get('/api/test', (req, res) => {
  try {
    // Implement the logic for your test API feature here
    const responseData = {
      message: 'This is a test API feature!',
      timestamp: new Date().toISOString(),
    };

    // Send a JSON response with the test data
    res.json(responseData);
  } catch (error) {
    // Handle errors and send an error response if necessary
    console.error('Error in test API:', error);
    res.status(500).json({ error: 'An error occurred in the test API.' });
  }
});

app.get('/api/:tableName', async (req, res) => {
  const tableName = req.params.tableName;

  try {
    // Check if the table exists in the database
    const [tableExists] = await connection.query(`SHOW TABLES LIKE '${tableName}'`);
    if (tableExists.length === 0) {
      res.status(404).json({ error: `Table '${tableName}' not found` });
      return;
    }

    // Retrieve data from the specified table
    const [results] = await connection.query(`SELECT * FROM ${tableName}`);
    res.json(results);
  } catch (err) {
    console.error('Database query error: ' + err.stack);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/login', async function (req, res) {
  const { email, password } = req.body;

  try {
    // Perform a database query to retrieve the hashed password for the given email
    const [results] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);

    if (results.length > 0) {
      const user = results[0];

      // Compare the provided password with the hashed password using bcrypt
      console.log(password);
      const passwordMatch = await bcrypt.compare(password, (user.password.replace(/^\$2y(.+)$/i, '$2b$1')));

      if (passwordMatch) {
        // Passwords match, login successful
        res.status(200).json({ message: 'Login successful' });
        console.log('success');
      } else {
        // Passwords do not match, login failed
        res.status(401).json({ error: 'Invalid credentials' });
        console.log('invalid');
      }
    } else {
      // No user found with the provided email
      res.status(402).json({ error: 'No user found with entered credentials' });
      console.log('a');
    }
  } catch (err) {
    console.error('Database query error: ' + err.stack);
    res.status(500).send('Database error');
  }
});

app.get('/findByVisitor/:email', async function (req, res) {
  const { email } = req.params;
  console.log(email);
  try {
    // Perform a database query to retrieve all visitorIDs for the given email
    const [visitorResults] = await connection.query('SELECT id FROM visitors WHERE email = ?', [email]);

    if (visitorResults.length > 0) {
      console.log('visitor found!');

      // Extract all visitorIDs from the results
      const visitorIds = visitorResults.map(visitor => visitor.id);

      // Perform another database query to retrieve all unused bookings and booking details for the given visitor IDs
      const [bookingResults] = await connection.query(
        `SELECT 
          b.id AS bookingId, 
          b.bookingID AS bookId, 
          b.ticketTypeID, 
          b.totalPrice, 
          b.bookingDate, 
          t.ticketTypeName, 
          bd.id AS detailID, 
          bd.demoCategoryID, 
          bd.quantity, 
          bd.is_local,
          dc.demoCategoryName
        FROM 
          bookings b 
          JOIN ticket_types t ON b.ticketTypeID = t.id 
          LEFT JOIN booking_details bd ON b.id = bd.bookID 
          LEFT JOIN demo_categories dc ON bd.demoCategoryID = dc.id
        WHERE 
          b.visitorID IN (?) AND 
          b.bookingStatus = 1 AND
          bd.quantity > 0
        `, 
        [visitorIds]
      );

      console.log("results: " + bookingResults.length);

      if (bookingResults.length > 0) {
        console.log('success');
        console.log(bookingResults);

        // Initialize an empty object to store bookings
        const bookingsMap = {};

        // Loop through the booking results
        for (const bookingDetails of bookingResults) {
          const { bookingId, bookId, ticketTypeName, totalPrice, bookingDate, detailID, demoCategoryName, quantity, is_local } = bookingDetails;

          // Check if the bookingId is already in the bookingsMap
          if (!bookingsMap[bookingId]) {
            // If not, create a new booking object
            bookingsMap[bookingId] = {
              id: bookingId,
              bookingID: bookId, 
              ticketTypeName: ticketTypeName,
              price: totalPrice,
              date: bookingDate,
              details: [] // Initialize an empty array for details
            };
          }

          // Add the detail to the details array of the corresponding booking
          if (detailID) {
            bookingsMap[bookingId].details.push({
              demoCategoryName: demoCategoryName,
              quantity: quantity,
              is_local: is_local
            });
          }
        }

        // Convert the bookingsMap object into an array of bookings
        const customData = Object.values(bookingsMap);

        // Return the array of custom data as JSON
        res.json({
          success: true,
          data: customData,
        });
      } else {
        console.log('failed');

        // If no booking results found, return an error message
        res.json({
          success: false,
          message: 'No unused bookings found for the visitor ID',
        });
      }
    } else {
      // If no visitor results found, return an error message
      res.json({
        success: false,
        message: 'Visitor not found for the given email',
      });
    }
  } catch (err) {
    console.error('Database query error: ' + err.stack);

    // Handle database error
    res.status(500).json({
      success: false,
      message: 'Database error',
    });
  }
});



const useBooking = async (bookId) => {
  try {
    // Perform a database query to update the status of the booking based on the booking ID
    const [updateResult] = await connection.query('UPDATE bookings SET bookingStatus = 0 WHERE bookingID = ?', [bookId]);

    // Check if the update was successful
    if (updateResult.affectedRows > 0) {
      return true; // Return true if the update was successful
    } else {
      return false; // Return false if the update failed
    }
  } catch (error) {
    console.error('Error updating booking status in database:', error);
    throw error; // Throw the error to be caught by the caller
  }
};

app.put('/api/unuse/:bookingId', async (req, res) => {
  const bookingId = req.params.bookingId;

  try {
    // Update booking status to 1 (assuming 1 represents "unused" status)
    const [updateResult] = await connection.query('UPDATE bookings SET bookingStatus = 1 WHERE bookingID = ?', [bookingId]);

    // Check if any rows were affected by the update
    if (updateResult.affectedRows === 0) {
      res.status(404).json({ error: `Booking with ID ${bookingId} not found` });
      return;
    }

    res.json({ success: true, message: `Booking with ID ${bookingId} has been set to 1` });
  } catch (err) {
    console.error('Database query error: ' + err.stack);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/setStatus/:bookingId', async (req, res) => {
  const { bookingId } = req.params;

  try {
    const updateResult = await useBooking(bookingId);

    if (updateResult) {
      // If the update was successful
      res.json({ success: true, message: 'Ticket status updated successfully' });
    } else {
      // If the update failed
      res.status(500).json({ success: false, message: 'Failed to update ticket status' });
    }
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ success: false, message: 'Error updating ticket status' });
  }
});


app.get('/scanQR1/:bookingId', async function (req, res) {
  const { bookingId } = req.params;
  console.log('Scanned Booking ID:', bookingId);
  try {
    // Perform a database query to retrieve the booking details based on the booking ID
    const [bookingResults] = await connection.query(
      `SELECT 
        b.bookingID,
        b.ticketTypeID, 
        b.totalPrice, 
        b.bookingDate, 
        t.ticketTypeName, 
        bd.id AS detailID, 
        bd.demoCategoryID, 
        bd.quantity, 
        bd.is_local,
        dc.demoCategoryName
      FROM 
        bookings b 
        JOIN ticket_types t ON b.ticketTypeID = t.id 
        LEFT JOIN booking_details bd ON b.id = bd.bookID 
        LEFT JOIN demo_categories dc ON bd.demoCategoryID = dc.id
      WHERE 
        b.bookingID = ? 
        AND b.bookingStatus = 1
        AND bd.quantity > 0
      `, 
      [bookingId]
    );

    if (bookingResults.length > 0) {
      console.log('Booking details found:', bookingResults);

      // Update booking status to 0 (used)
      await connection.query('UPDATE bookings SET bookingStatus = 0 WHERE bookingID = ? AND bookingStatus = 1', [bookingId]);
      console.log(`Booking status for bookingID ${bookingId} set to 0 (used) successfully.`);

      // Initialize an empty object to store bookings
      const bookingsMap = {};

      // Loop through the booking results
      for (const bookingDetails of bookingResults) {
        const { bookingId, ticketTypeName, totalPrice, bookingDate, detailID, demoCategoryName, quantity, is_local } = bookingDetails;

        // Check if the bookingId is already in the bookingsMap
        if (!bookingsMap[bookingId]) {
          // If not, create a new booking object
          bookingsMap[bookingId] = {
            id: bookingId,
            ticketTypeName: ticketTypeName,
            price: totalPrice,
            date: bookingDate,
            details: [] // Initialize an empty array for details
          };
        }

        // Add the detail to the details array of the corresponding booking
        if (detailID) {
          bookingsMap[bookingId].details.push({
            demoCategoryName: demoCategoryName,
            quantity: quantity,
            is_local: is_local
          });
        }
      }
      // Convert the bookingsMap object into an array of bookings
      const customData = Object.values(bookingsMap);

      // Return the array of custom data as JSON
      res.json({
        success: true,
        data: customData,
      });
    } else {
      console.log('Booking not found.');

      // If no booking results found, return an error message
      res.json({
        success: false,
        message: 'Booking not found or already used',
      });
    }
  } catch (err) {
    console.error('Database query error:', err.stack);

    // Handle database error
    res.status(500).json({
      success: false,
      message: 'Database error',
    });
  }
});


app.get('/scanQR/:bookingId', async function (req, res) {
  const { bookingId } = req.params;
  console.log('Scanned Booking ID:', bookingId);
  try {
    // Perform a database query to retrieve the booking details based on the booking ID
    const [bookingResults] = await connection.query(
      `SELECT 
        b.bookingID,
        b.ticketTypeID, 
        b.totalPrice, 
        b.bookingDate, 
        t.ticketTypeName, 
        bd.id AS detailID, 
        bd.demoCategoryID, 
        bd.quantity, 
        bd.is_local,
        dc.demoCategoryName
      FROM 
        bookings b 
        JOIN ticket_types t ON b.ticketTypeID = t.id 
        LEFT JOIN booking_details bd ON b.id = bd.bookID 
        LEFT JOIN demo_categories dc ON bd.demoCategoryID = dc.id
      WHERE 
        b.bookingID = ? 
        AND bd.quantity > 0
      `, 
      [bookingId]
    );

    if (bookingResults.length > 0) {
      console.log('Booking details found:', bookingResults);

      // Update booking status to 0 (used)
      const updateResult = await useBooking(bookingId);
      if (!updateResult) {
        throw new Error(`Failed to update booking status for bookingID ${bookingId}.`);
      } else {
        console.log(`Booking status for bookingID ${bookingId} set to 0 (used) successfully.`);
      }

      // Initialize an empty object to store bookings
      const bookingsMap = {};

      // Loop through the booking results
      for (const bookingDetails of bookingResults) {
        const { bookingId, ticketTypeName, totalPrice, bookingDate, detailID, demoCategoryName, quantity, is_local } = bookingDetails;

        // Check if the bookingId is already in the bookingsMap
        if (!bookingsMap[bookingId]) {
          // If not, create a new booking object
          bookingsMap[bookingId] = {
            id: bookingId,
            ticketTypeName: ticketTypeName,
            price: totalPrice,
            date: bookingDate,
            details: [] // Initialize an empty array for details
          };
        }

        // Add the detail to the details array of the corresponding booking
        if (detailID) {
          bookingsMap[bookingId].details.push({
            demoCategoryName: demoCategoryName,
            quantity: quantity,
            is_local: is_local
          });
        }
      }
      // Convert the bookingsMap object into an array of bookings
      const customData = Object.values(bookingsMap);

      // Return the array of custom data as JSON
      res.json({
        success: true,
        data: customData,
      });
    } else {
      console.log('Booking not found.');

      // If no booking results found, return an error message
      res.json({
        success: false,
        message: 'Booking not found or already used',
      });
    }
  } catch (err) {
    console.error('Database query error:', err.stack);

    // Handle database error
    res.status(500).json({
      success: false,
      message: 'Database error',
    });
  }
});



app.post('/send-email', async (req, res) => {
  // Send email route handler
  const { email, pin } = req.body;

  try {
    // Check if the email exists in the database
    const [results] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);

    if (results.length === 0) {
      // If the email does not exist in the database
      res.status(404).send('Email not found in the database.');
      return;
    }

    // Create a nodemailer transporter
    /*
    let transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'dexteryeo70@gmail.com', // Your Gmail email address
        pass: 'afge axts kfap svdx' // Your Gmail password or App Password if using 2-Step Verification
      }
    });
    */
    let transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'zoowildlifefyp@gmail.com', 
        pass: 'jyzwhnqkvugolqvg' 
      }
    });

    // Send email
    let info = await transporter.sendMail({
      from: '"Zoo Ticketing"',
      to: email,
      subject: 'Password Reset PIN',
      text: `Your PIN for password reset is: ${pin}`,
      html: `<p>Your PIN for password reset is: <strong>${pin}</strong></p>`
    });

    console.log('Message sent: %s', info.messageId);
    res.status(200).send('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Failed to send email.');
    
  }
});


app.post('/reset-password', async (req, res) => {
  const { email, password } = req.body;
  try {
    var hashedPassword = await bcrypt.hash(password, 12); 

    hashedPassword = hashedPassword.replace(/^\$2b(.+)$/i, '$2y$1');

    const [updateResult] = await connection.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

    console.log(hashedPassword);

    if (updateResult.affectedRows > 0) {
      res.json({ status: 'Password changed!' });
    } else {
      res.status(404).json({ error: 'Email not found or password same?' });
    }
  } catch (error) {
    console.error('Database query error: ' + error.stack);

    res.status(500).json({
      error: 'Database error',
    });
  }
});


app.post('/submit-report', async (req, res) => {
  const { image, subject, description, email } = req.body;

  try {
    let imageBuffer = null; 
    
    if (image && image.trim() !== '') {
      imageBuffer = Buffer.from(image, 'base64');
    }
    
    const currentTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const [insertResult] = await connection.query(
      'INSERT INTO reports (image, SUBJECT, description, email, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)', 
      [imageBuffer, subject, description, email, currentTimestamp, currentTimestamp]
    );
    if (insertResult.affectedRows > 0) {
      res.json({ status: 'Report submitted!' });
    } else {
      res.status(500).json({ error: 'Failed to submit report.' });
    }
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});



const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
