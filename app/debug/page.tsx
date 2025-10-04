"use client";

import { useState, useEffect } from 'react';
import { useSocketStore } from '@/lib/socket-client';

export default function DebugPage() {
  const [token, setToken] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [manualToken, setManualToken] = useState<string>('');
  const { isConnected, connect, socket } = useSocketStore();

  const addLog = (message: string) => {
    setLogs(prev => [message, ...prev]);
    console.log(message);
  };

  // Check token on load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    setToken(savedToken || 'No token found');
    
    if (savedToken) {
      addLog(`Found token in localStorage: ${savedToken.substring(0, 15)}...`);
      try {
        // Try to parse the token (if it's a JWT)
        const parts = savedToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          addLog(`Token payload: ${JSON.stringify(payload, null, 2)}`);
          
          // Check if token is expired
          if (payload.exp) {
            const expDate = new Date(payload.exp * 1000);
            const now = new Date();
            if (expDate < now) {
              addLog(`⚠️ Token expired on ${expDate.toLocaleString()}`);
            } else {
              addLog(`Token valid until ${expDate.toLocaleString()}`);
            }
          }
        }
      } catch (e) {
        addLog(`Error parsing token: ${e}`);
      }
    } else {
      addLog('No token found in localStorage');
    }
  }, []);

  // Monitor connection status
  useEffect(() => {
    addLog(`Socket connection status: ${isConnected ? 'Connected' : 'Disconnected'}`);
    
    // Check socket ID if connected
    if (isConnected && socket) {
      addLog(`Socket connected with ID: ${socket.id}`);
    }
  }, [isConnected, socket]);

  const handleClearToken = () => {
    localStorage.removeItem('token');
    setToken('Token cleared');
    addLog('Token removed from localStorage');
  };

  const handleSetToken = () => {
    if (manualToken) {
      localStorage.setItem('token', manualToken);
      setToken(manualToken);
      addLog(`Set new token: ${manualToken.substring(0, 15)}...`);
    }
  };

  const handleConnect = () => {
    const currentToken = localStorage.getItem('token');
    if (currentToken) {
      addLog('Attempting connection with current token...');
      connect(currentToken);
    } else {
      addLog('No token available for connection');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Connection Debugger</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-zinc-800 p-4 rounded-md">
          <h2 className="font-bold mb-2">Connection Status</h2>
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          
          <button 
            onClick={handleConnect}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Attempt Connection
          </button>
        </div>
        
        <div className="bg-zinc-800 p-4 rounded-md">
          <h2 className="font-bold mb-2">Token Management</h2>
          <div className="mb-4">
            <p className="text-sm mb-1">Current Token:</p>
            <div className="bg-zinc-900 p-2 rounded text-xs break-all max-h-20 overflow-y-auto">
              {token || 'No token'}
            </div>
          </div>
          
          <div className="mb-4">
            <button 
              onClick={handleClearToken}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Clear Token
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-sm mb-1">Set New Token:</p>
            <input 
              type="text" 
              value={manualToken} 
              onChange={(e) => setManualToken(e.target.value)}
              className="w-full p-2 bg-zinc-900 rounded mb-2"
              placeholder="Paste token here"
            />
            <button 
              onClick={handleSetToken}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Set Token
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-zinc-800 p-4 rounded-md">
        <h2 className="font-bold mb-2">Debug Logs</h2>
        <div className="bg-zinc-900 p-2 rounded h-60 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className="text-sm border-b border-zinc-800 py-1">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
