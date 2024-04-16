import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; 

function App() {
  const [songName, setSongName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [yearOfRelease, setYearOfRelease] = useState('');
  const [message, setMessage] = useState('');
  const [connectedRegion, setConnectedRegion] = useState('');
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    fetchConnectedRegion();
  }, []);

  const fetchConnectedRegion = async () => {
    try {
      const response = await axios.get('http://localhost:3000/connected_region');
      setConnectedRegion(response.data.region);
    } catch (error) {
      console.error('Failed to fetch connected region:', error);
    }
  };

  const handleGetSong = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/songs/${songName}`);
      setSongs(response.data); // Update songs state with fetched data
      setMessage(''); // Clear any previous message
    } catch (error) {
      setMessage('Song not found');
    }
  };

  const handleAddSong = async () => {
    try {
      await axios.post('http://localhost:3000/songs', { songName, artistName, yearOfRelease });
      setMessage('Song added successfully');
    } catch (error) {
      setMessage('Failed to add song');
    }
  };

  return (
    <div className="container">
      <div className="content">
        <h1 className="title">🎶 Songs Database 🎶</h1>
        <div className="region-info">
          <p>Connected Region: {connectedRegion}</p>
        </div>
        <div className="form-group">
          <label>Song Name:</label>
          <input type="text" value={songName} onChange={(e) => setSongName(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Artist Name:</label>
          <input type="text" value={artistName} onChange={(e) => setArtistName(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Year of Release:</label>
          <input type="number" value={yearOfRelease} onChange={(e) => setYearOfRelease(e.target.value)} />
        </div>
        <div className="button-group">
          <button className="get-all-btn" onClick={handleAddSong}>Add Song</button>
          <button className="get-all-btn" onClick={handleGetSong}>Get Songs</button>
        </div>
        <div className="message">{message}</div>
        <div className="song-list">
          {songs.map((song, index) => (
            <div key={index} className="song-item">
              <p><strong>Name:</strong> {song.Name.S}</p>
              {/* <p><strong>Artist:</strong> {song.Artist.S}</p>
              <p><strong>Year of Release:</strong> {song.ReleaseYear.S}</p> */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
