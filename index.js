const express = require('express');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors({ origin: 'http://localhost:5173' })); // Allow requests from frontend origin
app.use(bodyParser.json());

// MongoDB connection URI
const uri = 'mongodb+srv://kvmediaworks:vaigai123@cluster0.4q4po.mongodb.net/kvmediaworks?retryWrites=true&w=majority';
let db;

// Connect to MongoDB Atlas with updated SSL options
mongodb.MongoClient.connect(uri, { 
  tls: true,
  tlsAllowInvalidCertificates: true // Allows invalid SSL certificates for testing
})
  .then(client => {
    db = client.db('kvmediaworks');
    console.log('Connected to MongoDB');
  })
  .catch(error => {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit if MongoDB connection fails
  });

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'vaigaivendhan138@gmail.com', // Your email address
    pass: 'xltx mshj hpas fpwt' // Your app password (if 2FA is enabled)
  }
});

// Endpoint to handle form submissions
app.post('/contact', async (req, res) => {
  const { fullname, email, phone, message } = req.body;

  try {
    // Ensure MongoDB connection is established
    if (!db) {
      throw new Error('Database connection not established');
    }

    // Save form data to MongoDB
    const contactCollection = db.collection('contacts');
    await contactCollection.insertOne({ fullname, email, phone, message });

    // Prepare email data
    const mailOptions = {
      from: `${email}`, // Sender address
      to: 'mediaworkskv@gmail.com', // Replace with the recipient's email address
      subject: 'New Contact Form Submission',
      text: `You have received a new message from your website contact form:\n\n` +
            `Name: ${fullname}\n` +
            `Email: ${email}\n` +
            `Phone: ${phone}\n` +
            `Message: ${message}`
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');

    res.status(200).send({ success: true, message: 'Data saved successfully and email sent' });
  } catch (error) {
    console.error('Error saving data or sending email:', error);
    res.status(500).send({ success: false, message: 'Error occurred', error: error.message });
  }
});

// Start the server
app.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});
