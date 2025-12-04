"use client";

import React, { useState, useEffect, useRef } from "react";
import LivePriceCard from "./LivePriceCard";
import { AUTH_TOKEN, SESSION_SID } from "@/config/constant";

// --- CONFIGURATION CONSTANTS (REPLACE THESE) ---

/** @type {string} Replace with your actual WebSocket URL for HSM */
const WEBSOCKET_URL = "wss://mlhsm.kotaksecurities.com";

// Static list of stock symbols for the demo dropdown
const STOCK_SYMBOLS = [
  { name: "RELIANCE", identifier: "nse_cm|2885" }, // Example identifier (needs verification)
  { name: "TCS", identifier: "nse_cm|3456" },
  { name: "INFY", identifier: "nse_cm|1594" },
  { name: "HDFCBANK", identifier: "nse_cm|11536" },
];

/** * @param {string} identifier Kotak exchange_identifier for a scrip
 * @returns {object} The subscription payload
 */
const getSubscriptionPayload = (identifier) => ({
  type: "mws", // Market Watch Stream (Scrip subscription type)
  scrips: identifier,
  channelnum: 1, // Example channel number
});

// ----------------------------------------------

// Initial state for the price card
const initialPriceState = {
  stockName: STOCK_SYMBOLS[0].name,
  currentPrice: 0.0,
  changePercent: 0.0,
};

export default function HomePageComponent() {
  const [selectedStock, setSelectedStock] = useState(STOCK_SYMBOLS[0]);
  const [livePrice, setLivePrice] = useState(initialPriceState);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null); // Ref to hold the WebSocket instance

  // --- WebSocket Connection Logic ---
  useEffect(() => {
    // Clean up function runs on component unmount or dependency change
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleConnect = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log("WebSocket is already open.");
      // Re-subscribe if already open
      handleSubscribe();
      return;
    }

    // Close any existing connection first
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      const ws = new WebSocket(WEBSOCKET_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket Connected");
        setIsConnected(true);

        // 1. Send the Connection / Authorization payload
        const connPayload = JSON.stringify({
          Authorization: AUTH_TOKEN,
          Sid: SESSION_SID,
          type: "cn", // Connect type
        });
        ws.send(connPayload);

        // 2. Subscribe to the selected scrip after connection is established
        // Use a timeout to ensure 'cn' is processed first (best practice)
        setTimeout(handleSubscribe, 500);
      };

      ws.onmessage = (event) => {
        try {
          console.log("test123", { event });
          const data = JSON.parse(event.data);
          // Check for market watch data type 'mwt'
          if (
            data.type === "mwt" &&
            data.identifier === selectedStock.identifier
          ) {
            // Your raw data structure needs parsing here.
            // Assuming data contains: { type: 'mwt', identifier: '...', LTP: '1234.50', NetChange: '...', PercentChange: '...' }

            const ltp = parseFloat(data.LTP || 0); // Use your actual JSON key for Last Traded Price
            const percentChange = parseFloat(data.PercentChange || 0); // Use your actual JSON key

            if (ltp > 0) {
              setLivePrice({
                stockName: selectedStock.name,
                currentPrice: ltp,
                changePercent: percentChange,
              });
            }
          }
          // You might also need to handle 'ti' (tick/heartbeat) for connection upkeep
          if (data.type === "ti") {
            // Handle heartbeat if necessary
          }
        } catch (error) {
          console.error("Error processing message:", error);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket Disconnected");
        setIsConnected(false);
      };

      ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error("Connection attempt failed:", error);
      setIsConnected(false);
    }
  };

  const handleDisconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      setIsConnected(false);
      console.log("Live Feed Stopped");
    }
  };

  const handleSubscribe = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify(
        getSubscriptionPayload(selectedStock.identifier)
      );
      wsRef.current.send(payload);
      console.log(
        `Subscribed to: ${selectedStock.name} with identifier: ${selectedStock.identifier}`
      );
    } else {
      console.warn("Cannot subscribe: WebSocket not connected.");
    }
  };

  // --- Effect to handle stock selection change ---
  useEffect(() => {
    // 1. Update the price card's displayed name immediately
    setLivePrice((prev) => ({
      ...prev,
      stockName: selectedStock.name,
    }));

    // 2. If already connected, unsubscribe from old and subscribe to new
    if (isConnected) {
      // Note: Full unsubscribe/reconnect logic is complex (requires knowing old scrip ID).
      // For this demo, we'll just subscribe to the new one. The server will likely handle
      // dropping the old subscription if using a new 'cn' or if it supports re-subscription.
      // For a robust implementation, you would send an 'unsub' for the old identifier.

      // Re-subscribe to the new stock
      handleSubscribe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStock, isConnected]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white">
          🚀 Kotak Live Feed Terminal
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Modern Next.js + Tailwind UI for HSM WebSocket data.
        </p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Side Panel (Controls) */}
        <div className="h-full">
          <div className="p-6 md:p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              Trading Controls
            </h2>

            {/* Connection Status */}
            <div
              className={`mb-6 p-3 rounded-lg flex items-center ${
                isConnected
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full mr-3 ${
                  isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              ></div>
              <span className="font-medium">
                Status: {isConnected ? "Live Connected" : "Disconnected"}
              </span>
            </div>

            {/* Select Box (Dropdown) */}
            <div className="mb-8">
              <label
                htmlFor="stock-select"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Select Stock ({selectedStock.name})
              </label>
              <select
                id="stock-select"
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={selectedStock.identifier}
                onChange={(e) => {
                  const newStock = STOCK_SYMBOLS.find(
                    (s) => s.identifier === e.target.value
                  );
                  setSelectedStock(newStock);
                }}
                disabled={isConnected} // Optionally disable while connected to prevent race conditions
              >
                {STOCK_SYMBOLS.map((stock) => (
                  <option key={stock.identifier} value={stock.identifier}>
                    {stock.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Two Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleConnect}
                disabled={isConnected}
                className={`
                  flex-1 py-3 px-6 rounded-full font-semibold text-white transition duration-300 ease-in-out
                  ${
                    isConnected
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 shadow-md shadow-green-500/50 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  }
                `}
              >
                {isConnected ? "LIVE FEED ACTIVE" : "Start Live Feed"}
              </button>

              <button
                onClick={handleDisconnect}
                disabled={!isConnected}
                className={`
                  flex-1 py-3 px-6 rounded-full font-semibold text-white transition duration-300 ease-in-out
                  ${
                    !isConnected
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/50 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  }
                `}
              >
                Stop Live Feed
              </button>
            </div>

            <p className="mt-8 text-xs text-gray-400 dark:text-gray-500">
              NOTE: You will need to replace the placeholders for
              **WEBSOCKET_URL**, **AUTH\_TOKEN**, and **SESSION\_SID** in this
              file. The `identifier` values in `STOCK_SYMBOLS` must match your
              server's expected format (e.g., `nse_cm|11536`).
            </p>
          </div>
        </div>

        {/* Right Side Panel (Live Price Box) */}
        <div className="h-full flex items-start">
          <div className="w-full">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              Live Market Data
            </h2>
            <LivePriceCard
              stock={livePrice.stockName}
              price={livePrice.currentPrice}
              changePercent={livePrice.changePercent}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
