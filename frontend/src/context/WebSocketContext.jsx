
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
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

  useEffect(() => {
    let client = null;

    try {
      client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
        connectHeaders: {},
        debug: (str) => {
          console.log(new Date(), str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onWebSocketError: (error) => {
          console.warn('WebSocket error - Backend may not be available:', error);
          setIsConnected(false);
        },
      });

      client.onConnect = (frame) => {
        setIsConnected(true);
        console.log('Connected: ' + frame);

        client.subscribe('/topic/data', (message) => {
          try {
            if (message.body) {
              const newData = JSON.parse(message.body);
              console.log('New Data Received:', newData);
              
              setDataHistory(prevHistory => [...prevHistory.slice(-29), newData]);
              setLatestData(newData);
            }
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        });
      };

      client.onStompError = (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
        setIsConnected(false);
      };

      client.onDisconnect = () => {
        setIsConnected(false);
        console.log('Disconnected!');
      };

      client.activate();
    } catch (error) {
      console.error('Failed to initialize WebSocket connection:', error);
      setIsConnected(false);
    }

    return () => {
      if (client) {
        try {
          client.deactivate();
        } catch (error) {
          console.error('Error deactivating WebSocket client:', error);
        }
      }
    };
  }, []);

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