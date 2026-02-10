import ActionProvider from "./ActionProvider";

export default class MessageParser {
  private actionProvider: ActionProvider;

  constructor(actionProvider: ActionProvider) {
    this.actionProvider = actionProvider;
  }

  async parse(message: string) {
    const response = await fetch("/api/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    this.actionProvider.handleChatGPTResponse(data.reply);
  }
}
