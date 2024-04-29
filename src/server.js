import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import AWS from 'aws-sdk';

const app = express();
app.use(cors({
    origin: "*",
    methods: "*",
    headers: "*",
}));
app.use(bodyParser.json());

// Define Server Port
const PORT = 3000;

// Define the name of the DynamoDB table
const table_name = 'Songs';

// AWS Configuration
const dynamodb = new AWS.DynamoDB({
    region: 'us-east-2',
    accessKeyId: process.env.access_key_id,
    secretAccessKey: process.env.secret_access_key
});

// Add CORS middleware
app.use(cors());

// Get connected DynamoDB client
const getDynamoDBClient = () => {
    try {
        dynamodb.describeTable({ TableName: table_name }, (err, data) => {
            if (err) {
                // If us-east-2 is not available or table doesn't exist, fallback to us-east-1
                dynamodb.config.update({ region: 'us-east-1' });
                console.log("Connected to us-east-1");
            } else {
                console.log("Connected to us-east-2");
            }
        });
    } catch (error) {
        console.error("Error connecting to DynamoDB:", error);
    }
};

// Function to get song from DynamoDB
const getSong = async (songName) => {
    try {
        const params = {
            TableName: table_name,
            Key: {
                'Name': { S: songName } // Assuming 'Name' is a string attribute
            }
        };
        const data = await dynamodb.getItem(params).promise();
        return data.Item;
    } catch (error) {
        console.error("Error getting song:", error);
        return null;
    }
};

// Function to add song to DynamoDB
const addSong = async (name, artist, releaseYear) => {
    try {
        const params = {
            TableName: table_name,
            Item: {
                'Name': { S: name }, // Assuming 'Name' is a string attribute
                'Artist': { S: artist }, // Assuming 'Artist' is a string attribute
                'ReleaseYear': { S: releaseYear } // Assuming 'ReleaseYear' is a string attribute
            }
        };
        await dynamodb.putItem(params).promise(); // Changed put to putItem
        console.log("Song added successfully");
        return true;
    } catch (error) {
        console.error("Error adding song:", error);
        return false;
    }
};

// Function to get all songs from DynamoDB
const getAllSongs = async () => {
    try {
        const params = {
            TableName: table_name
        };
        const data = await dynamodb.scan(params).promise();
        return data.Items;
    } catch (error) {
        console.error("Error getting all songs:", error);
        return [];
    }
};

// Routes
app.get("/songs/:Name", async (req, res) => {
    const { Name } = req.params;
    const song = await getSong(Name);
    if (song) {
        res.status(200).send(song);
    } else {
        res.status(404).send({ message: "Song not found" });
    }
});

app.get("/songs", async (req, res) => {
    const songs = await getAllSongs();
    res.status(200).send(songs);
});

app.post("/songs", async (req, res) => {
    const { Name, Artist, ReleaseYear } = req.body;
    if (await addSong(Name, Artist, ReleaseYear)) {
        res.status(201).send({ message: "Song added successfully" });
    } else {
        res.status(500).send({ message: "Failed to add song" });
    }
});

app.get("/connected_region", (req, res) => {
    res.status(200).send({ region: dynamodb.config.region });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    getDynamoDBClient();
});
