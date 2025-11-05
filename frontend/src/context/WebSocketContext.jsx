import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WebSocketContext = createContext(null);

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};

export const WebSocketProvider = ({ children }) => {
  const [dataHistory, setDataHistory] = useState([]);
  const [latestData, setLatestData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  const initializeWebSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.deactivate();
      socketRef.current = null;
    }

    try {
      const client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
        connectHeaders: {},
        debug: (str) => {
          console.log('[WebSocket]', new Date().toLocaleTimeString(), str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onWebSocketError: (error) => {
          console.warn('[WebSocket] Error - Backend may not be available:', error);
          setIsConnected(false);
        },
      });

      client.onConnect = (frame) => {
        setIsConnected(true);
        console.log('Connected: ' + frame);

        // Subscribe to real-time data updates
        client.subscribe('/topic/data', (message) => {
          try {
            if (message.body) {
              const receivedData = JSON.parse(message.body);
              console.log('[WebSocket]  New Data Received:', receivedData);
              
              // Debug UV value specifically
              if (!Array.isArray(receivedData) && receivedData.uv !== undefined) {
                console.log('[WebSocket]  UV Value:', receivedData.uv, 'Type:', typeof receivedData.uv);
              }

              if (Array.isArray(receivedData)) {
                // Initial data load - set entire history
                const latest30 = receivedData.slice(-30);
                console.log('[WebSocket]  Initial data loaded:', latest30.length, 'records');
                setDataHistory(latest30);
                if (receivedData.length > 0) {
                  setLatestData(receivedData[receivedData.length - 1]);
                }
              } else {
                // Single new data point - append to history
                console.log('[WebSocket]  Adding new data point to history');
                setDataHistory((prevHistory) => {
                  const newHistory = [...prevHistory, receivedData];
                  // Keep only last 30 data points
                  return newHistory.slice(-30);
                });
                setLatestData(receivedData);
              }
            }
          } catch (error) {
            console.error('[WebSocket]  Error parsing message:', error);
          }
        });

        console.log('[WebSocket] Requesting initial data load...');
        client.publish({ destination: '/app/getData', body: '' });
      };

      client.onDisconnect = () => {
        console.log('[WebSocket] Disconnected from server');
        setIsConnected(false);
      };

      client.activate();
      socketRef.current = client;
      console.log('[WebSocket]  Initializing connection...');
    } catch (error) {
      console.error('[WebSocket]  Error setting up WebSocket:', error);
    }
  }, []);

  useEffect(() => {
    console.log('[WebSocket]  Starting WebSocket initialization...');
    initializeWebSocket();

    return () => {
      console.log('[WebSocket]  Cleaning up WebSocket connection...');
      if (socketRef.current) {
        socketRef.current.deactivate();
        socketRef.current = null;
      }
    };
  }, [initializeWebSocket]);

  const value = useMemo(() => ({
    dataHistory,
    latestData,
    isConnected,
  }), [dataHistory, latestData, isConnected]);

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};