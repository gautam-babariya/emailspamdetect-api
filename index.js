const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');

const app = express();
const cors = require('cors');

// cors code 
app.use(cors())
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Max-Age', 2592000);
    next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

 

app.get('/', (res, req) => {
  req.send("hy");
})

// Define a route to handle predictions
app.post('/predict', (req, res) => {
  // Sample input data
  try {
    const title = req.body;
    const value = Object.keys(title)[0];
    const inputData = value;
    
    // Spawn a Python process
    const pythonProcess = spawn('python', ['load_model.py', JSON.stringify(inputData)]);
    
    // Listen for data from Python script
    pythonProcess.stdout.on('data', (data) => {
      var predictions = JSON.parse(data.toString());
      if (predictions == '1') {
        res.status(201).json('spam');
        }
        else {
        res.status(201).json('not spam');
      }
    });

    // Listen for errors from Python script
    pythonProcess.stderr.on('data', (data) => {
      console.error(`Error from Python script: ${data.toString()}`);
    });

    
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Servers Error');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
