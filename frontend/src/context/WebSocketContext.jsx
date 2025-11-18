import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WebSocketContext = createContext(null);

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};

export const WebSocketProvider = ({ children }) => {
  // Fundamental change: data stored as object { "MAC_ADDRESS": [point1, point2, ...] }
  const [stationsData, setStationsData] = useState({});
  
  // Station status (Online/Offline) and last seen time
  const [stationsStatus, setStationsStatus] = useState({});
  
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  // Handle incoming data
  const handleNewData = useCallback((newData) => {
    const mac = newData.mac;
    if (!mac) return;

    const now = Date.now();

    setStationsData(prev => {
      const currentHistory = prev[mac] || [];
      // Add new data and keep only last 30 points for this station
      const newHistory = [...currentHistory, newData].slice(-30);
      return { ...prev, [mac]: newHistory };
    });

    // Update station status to "online" and update last seen time
    setStationsStatus(prev => ({
      ...prev,
      [mac]: { status: 'online', lastSeen: now }
    }));
  }, []);

  // Periodically check for disconnected stations
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setStationsStatus(prev => {
        const newStatus = { ...prev };
        let hasChanges = false;
        
        Object.keys(newStatus).forEach(mac => {
          // If 60 seconds passed without data, consider it Offline
          if (now - newStatus[mac].lastSeen > 60000 && newStatus[mac].status !== 'offline') {
            newStatus[mac].status = 'offline';
            hasChanges = true;
          }
        });
        
        return hasChanges ? newStatus : prev;
      });
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Calculate real "national average" from latest reading of each connected station
  const latestData = useMemo(() => {
    const allMacs = Object.keys(stationsData);
    if (allMacs.length === 0) return null;

    // Take the last value received from each station
    const latestReadings = allMacs.map(mac => {
      const history = stationsData[mac];
      return history[history.length - 1];
    }).filter(Boolean);

    if (latestReadings.length === 0) return null;

    // Calculate average
    const sum = latestReadings.reduce((acc, curr) => ({
      temp: acc.temp + (curr.temp || 0),
      humidity: acc.humidity + (curr.humidity || 0),
      pression: acc.pression + (curr.pression || 0),
      co2: acc.co2 + (curr.co2 || 0),
      gas: acc.gas + (curr.gas || 0),
      uv: acc.uv + (curr.uv || 0),
    }), { temp: 0, humidity: 0, pression: 0, co2: 0, gas: 0, uv: 0 });

    const count = latestReadings.length;

    return {
      temp: sum.temp / count,
      humidity: sum.humidity / count,
      pression: Math.round(sum.pression / count),
      co2: Math.round(sum.co2 / count),
      gas: Math.round(sum.gas / count),
      uv: sum.uv / count,
      activeStations: count // Add actual number of active stations
    };
  }, [stationsData]);

  // Setup connection
  const initializeWebSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.deactivate();
    }

    try {
      const client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
        reconnectDelay: 5000,
        onWebSocketError: (error) => {
          console.warn('WebSocket Error:', error);
          setIsConnected(false);
        },
      });

      client.onConnect = () => {
        setIsConnected(true);
        client.subscribe('/topic/data', (message) => {
          try {
            if (message.body) {
              const receivedData = JSON.parse(message.body);
              if (Array.isArray(receivedData)) {
                // In case of initial load (data list)
                receivedData.forEach(handleNewData);
              } else {
                // In case of individual data
                handleNewData(receivedData);
              }
            }
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        });
        client.publish({ destination: '/app/getData', body: '' });
      };

      client.onDisconnect = () => setIsConnected(false);
      client.activate();
      socketRef.current = client;
    } catch (error) {
      console.error('Setup Error:', error);
    }
  }, [handleNewData]);

  useEffect(() => {
    initializeWebSocket();
    return () => socketRef.current?.deactivate();
  }, [initializeWebSocket]);

  return (
    <WebSocketContext.Provider value={{ 
      stationsData,    // Detailed data for each station
      latestData,      // Calculated general average
      stationsStatus,  // Connection status for each station
      isConnected 
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};