export default class ActionProvider {
  private createChatBotMessage: (message: string) => ChatBotMessage;
  private setState: (state: (prevState: ChatBotState) => ChatBotState) => void;

  constructor(
    createChatBotMessage: (message: string) => ChatBotMessage,
    setStateFunc: (state: (prevState: ChatBotState) => ChatBotState) => void
  ) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
  }

  handleChatGPTResponse(reply: string): void {
    const message = this.createChatBotMessage(reply);
    this.updateChatState(message);
  }

  updateChatState(message: ChatBotMessage): void {
    this.setState((prevState: ChatBotState) => ({
      ...prevState,
      messages: [...prevState.messages, message],
    }));
  }
}

interface ChatBotMessage {
  type: string;
  message: string;
  id?: string;
  [key: string]: unknown;
}

interface ChatBotState {
  messages: ChatBotMessage[];
  [key: string]: unknown;
}
