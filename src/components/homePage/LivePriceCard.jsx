import React, { useState, useEffect, useRef } from "react";

// Price update animation duration (ms)
const PRICE_ANIMATION_DURATION = 200;

const LivePriceCard = ({ stock, price, changePercent }) => {
  const [flash, setFlash] = useState(null); // 'up' or 'down'
  const prevPriceRef = useRef(price);

  useEffect(() => {
    // Check if the price has changed
    if (price !== prevPriceRef.current) {
      const isUp = price > prevPriceRef.current;
      setFlash(isUp ? "up" : "down");

      // Clear the flash class after the duration
      const timer = setTimeout(() => {
        setFlash(null);
      }, PRICE_ANIMATION_DURATION);

      // Update the previous price reference
      prevPriceRef.current = price;

      return () => clearTimeout(timer);
    }
  }, [price]);

  // Determine change color and sign
  const isPositive = changePercent >= 0;
  const changeColor = isPositive ? "text-green-500" : "text-red-500";
  const changeSign = isPositive ? "+" : "";

  // Tailwind classes for price flash animation
  let flashClass = "";
  if (flash === "up") {
    flashClass = "bg-green-100/70 border-green-500 shadow-green-200/50";
  } else if (flash === "down") {
    flashClass = "bg-red-100/70 border-red-500 shadow-red-200/50";
  }

  return (
    <div
      className={`
        p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl 
        transition-all duration-200 ease-out border-2 border-transparent
        ${flashClass}
      `}
      style={{ transitionDuration: `${PRICE_ANIMATION_DURATION}ms` }}
    >
      <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
        {stock}
      </h3>

      <div className="flex items-baseline space-x-4">
        <p
          className={`text-6xl font-extrabold transition-colors duration-200 dark:text-white ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          ₹{price.toFixed(2)}
        </p>
        <p className={`text-3xl font-bold ${changeColor}`}>
          {changeSign}
          {changePercent.toFixed(2)}%
        </p>
      </div>

      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Latest price update from WebSocket feed.
      </p>
    </div>
  );
};

export default LivePriceCard;
