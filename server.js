const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;


// serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to download a specific file
app.get('/api/download', (req, res) => {
    console.log("Received request to download:", req.url);

    const fileName = req.query.file;
    if (!fileName) {
        return res.status(400).send('File name is required');
    }

    const filePath = path.join(__dirname, 'downloads', fileName);

    // check if the file exists
    fs.stat(filePath, (err, stats) => {
        if (err) {
            console.error('File not found:', err);
            return res.status(404).send('File not found');
        }

        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Length', stats.size);

        // stream the file to the client
        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);

        // handle any errors while streaming
        readStream.on('error', (streamErr) => {
            console.error('Error while streaming the file:', streamErr);
            res.status(500).send('Internal Server Error');
        });
    });
});

// root route serves the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// send back hash in the particular file
app.get('/api/downloadHash', (req, res) => {
    console.log("Received request to download:", req.url);

    const fileName = req.query.fileName;
    const hashFileName = req.query.hashFile;

    if (!fileName) {
        console.log("no filename");
        return res.status(400).send('File name is required');
    } else if(!hashFileName) {
        console.log("no hash there");
        return res.status(400).send('File name is required');
    }
    const hashFilePath = path.join(__dirname, 'downloads/', hashFileName);

    fs.stat(hashFilePath, (err, stats) => {
        if (err) {
            console.error('File not found:', err);
            return res.status(404).send('File not found');
        }

        // read the content of hash.txt
        fs.readFile(hashFilePath, 'utf8', (readErr, data) => {
            if (readErr) {
                console.error('Error reading file:', readErr);
                return res.status(500).send('Internal Server Error');
            }

            res.setHeader('Content-Type', 'text/plain');
            // only send hash, not filename at the end of file
            res.send(data.split(' ')[0]);
        });
    });
});

app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});
