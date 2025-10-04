"use client";

import { useState, useEffect } from 'react';
import { useSocketStore } from '@/lib/socket-client';
import { toast } from 'sonner';

export default function SocketTestPage() {
  const { socket, isConnected, connect } = useSocketStore();
  const [status, setStatus] = useState<string>('Initializing...');
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [token, setToken] = useState<string>('');
  
  const addLog = (message: string) => {
    setLogMessages(prev => [message, ...prev].slice(0, 20));
  };

  useEffect(() => {
    // Get token from local storage
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }
    
    // Check services status
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        addLog(`Services status: Redis ${data.status.redis.connected ? '✅' : '❌'}, Kafka ${data.status.kafka.connected ? '✅' : '❌'}`);
      })
      .catch(err => {
        addLog(`Status API error: ${err.message}`);
      });
  }, []);

  useEffect(() => {
    setStatus(isConnected ? 'Connected ✅' : 'Disconnected ❌');
  }, [isConnected]);

  const handleConnect = () => {
    if (!token) {
      toast.error('Please provide a token');
      return;
    }
    
    addLog('Attempting to connect...');
    connect(token);
    localStorage.setItem('token', token);
  };
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Socket Connection Test</h1>
      
      <div className="bg-zinc-800 p-4 rounded-md mb-6">
        <h2 className="font-semibold mb-2">Connection Status: 
          <span className={isConnected ? 'text-green-500 ml-2' : 'text-red-500 ml-2'}>
            {status}
          </span>
        </h2>
        
        <div className="flex gap-4 mb-4 items-end">
          <div className="flex-1">
            <label className="block text-sm mb-1">Auth Token</label>
            <input 
              type="text" 
              value={token} 
              onChange={e => setToken(e.target.value)} 
              className="w-full p-2 rounded bg-zinc-900 border border-zinc-700"
              placeholder="Enter JWT token"
            />
          </div>
          <button 
            onClick={handleConnect} 
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
          >
            Connect
          </button>
        </div>
      </div>
      
      <div className="bg-zinc-800 p-4 rounded-md">
        <h2 className="font-semibold mb-2">Connection Logs</h2>
        <div className="bg-zinc-900 p-2 rounded-md h-60 overflow-y-auto font-mono text-sm">
          {logMessages.map((msg, i) => (
            <div key={i} className="mb-1 border-b border-zinc-800 pb-1">
              {msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
