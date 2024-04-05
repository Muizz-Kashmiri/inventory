// src/App.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; 

function App() {
  const [songName, setSongName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [yearOfRelease, setYearOfRelease] = useState('');
  const [message, setMessage] = useState('');
  const [connectedRegion, setConnectedRegion] = useState('');

  useEffect(() => {
    fetchConnectedRegion();
  }, []);

  const fetchConnectedRegion = async () => {
    try {
      const response = await axios.get('http://localhost:8000/connected_region');
      setConnectedRegion(response.data.region);
    } catch (error) {
      console.error('Failed to fetch connected region:', error);
    }
  };

  const handleGetSong = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/songs/${songName}`);
      setMessage(JSON.stringify(response.data));
    } catch (error) {
      setMessage('Song not found');
    }
  };

  const handleAddSong = async () => {
    try {
      await axios.post('http://localhost:8000/songs', { songName, artistName, yearOfRelease });
      setMessage('Song added successfully');
    } catch (error) {
      setMessage('Failed to add song');
    }
  };

  const handleUpdateSong = async () => {
    try {
      await axios.put(`http://localhost:8000/songs/${songName}`, { artistName });
      setMessage('Song updated successfully');
    } catch (error) {
      setMessage('Failed to update song');
    }
  };

  return (
    <div className="container">
      <div className="content">
        <h1 className="title">🎶 Chota Spotify 🎶</h1>
        <div className="region-info">
          <p>Connected Region: {connectedRegion}</p>
        </div>
        <div className="form-group">
          <label>Song Name:</label>
          <input type="number" value={yearOfRelease} onChange={(e) => setYearOfRelease(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Artist Name:</label>
          <input type="text" value={artistName} onChange={(e) => setYearOfRelease(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Year of Release:</label>
          <input type="number" value={artistName} onChange={(e) => setArtistName(e.target.value)} />
        </div>
        <div className="button-group">
          <button onClick={handleGetSong}>Get Song</button>
          <button onClick={handleAddSong}>Add Song</button>
          <button onClick={handleUpdateSong}>Update Song</button>
        </div>
        <div className="message">{message}</div>
      </div>
    </div>
  );
}

export default App;
