import { createChatBotMessage } from "react-chatbot-kit";

const config = {
  botName: "Realtor TrackBot",
  initialMessages: [
    createChatBotMessage("Hola 👋, ¿en qué puedo ayudarte?", {
      widget: "chat",
    }),
  ],
  customStyles: {
    chatButton: {
      backgroundColor: "#00B4D8",
    },
  },
};

export default config;
