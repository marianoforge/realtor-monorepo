import { useState } from "react";
import Chatbot from "react-chatbot-kit";

import "react-chatbot-kit/build/main.css";
import ActionProvider from "./ActionProvider";
import config from "./chatbotConfig";
import MessageParser from "./MessageParser";

export default function ChatHelper() {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="fixed bottom-20 right-6 flex flex-col items-start z-50 isolate">
      {/* Chatbot Container */}
      <div
        className={`transition-all duration-300 transform ${
          showChat ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      >
        {showChat && (
          <div className="w-80 bg-white shadow-xl border rounded-lg overflow-hidden">
            {/* Header del Chat */}
            <div className="bg-[#0074B6] text-white p-3 flex justify-between items-center">
              <span className="font-semibold">Realtor TrackBot</span>
              <button
                onClick={() => setShowChat(false)}
                className="text-white hover:text-gray-200"
              >
                ✖
              </button>
            </div>

            {/* Contenedor del Chatbot */}
            <div className="p-2">
              <Chatbot
                config={config}
                messageParser={MessageParser}
                actionProvider={ActionProvider}
                placeholderText="Escribe tu pregunta aquí..."
                headerText="Realtor TrackBot"
              />
            </div>
          </div>
        )}
      </div>

      {/* Botón Flotante del Chat */}
      <button
        className="flex items-center space-x-2 py-3 px-6 bg-[#0074B6] text-white rounded-full shadow-lg hover:bg-[#00B4D8'] transition-all transform hover:scale-105 mt-2"
        onClick={() => setShowChat(!showChat)}
      >
        <span className="text-lg">💬</span>
        <span className="font-medium">Realtor TrackBot</span>
      </button>
    </div>
  );
}
