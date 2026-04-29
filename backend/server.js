const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');


dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://mini-crm-backendd.netlify.app'
    
  ],
  credentials: true
}));
app.use(express.json());


app.use('/api/auth', require('./routes/auth'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/users', require('./routes/users'));

app.get('/', (req, res) => res.json({ message: 'Mini CRM API Running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
