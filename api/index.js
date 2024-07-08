const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');

const app = express();

var cors = require('cors')
app.use(cors())
// getdata from mongo 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET,POST');
  res.setHeader('Access-Control-Max-Age', 2592000);
  next();
});
 

app.get('/', (res, req) => {
  req.send("hyy");
})

// Define a route to handle predictions
app.post('/predict',async (req, res) => {
  // Sample input data
  try {
    const title = req.body;
    const value = Object.keys(title)[0];
    const inputData = value;
    
    // Spawn a Python process
    const pythonProcess = spawn('python3', ['../load_model.py', JSON.stringify(inputData)]);
    
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

    pythonProcess.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Python script exited with code ${code}`);
        res.status(500).send('Internal Server Error');
      }
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
