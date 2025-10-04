"use client";

import { useEffect, useState } from 'react';

export default function ResetToken() {
  const [status, setStatus] = useState('Clearing old token...');
  const [newToken, setNewToken] = useState('');

  useEffect(() => {
    async function resetToken() {
      try {
        // Clear any existing token
        localStorage.removeItem('token');
        setStatus('Old token cleared. Getting new token...');

        // Get a new token
        const response = await fetch('/api/auth/token');
        const data = await response.json();
        
        if (data.token) {
          // Store the new token
          localStorage.setItem('token', data.token);
          setNewToken(data.token);
          setStatus('New token set successfully! You can now return to the app.');
        } else {
          setStatus('Failed to get new token');
        }
      } catch (error) {
        setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    resetToken();
  }, []);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Token Reset Tool</h1>
      
      <div className="bg-zinc-800 p-4 rounded-md mb-6">
        <p className="mb-4">Status: <span className="font-bold">{status}</span></p>
        
        {newToken && (
          <div className="mt-4">
            <h2 className="font-bold mb-2">New Token:</h2>
            <div className="bg-zinc-900 p-2 rounded text-xs break-all">{newToken}</div>
          </div>
        )}
        
        <div className="mt-6">
          <a 
            href="/"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Application
          </a>
        </div>
      </div>
      
      <div className="bg-zinc-800 p-4 rounded-md">
        <h2 className="font-bold mb-2">What This Does</h2>
        <p>This page:</p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li>Removes any existing authentication token</li>
          <li>Generates a new, valid JWT token</li>
          <li>Stores it in your browser's localStorage</li>
          <li>This fixes connection issues caused by invalid tokens</li>
        </ul>
      </div>
    </div>
  );
}
