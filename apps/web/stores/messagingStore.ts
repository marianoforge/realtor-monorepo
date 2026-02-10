/* eslint-disable no-console */
import { create } from "zustand";
import { getToken, onMessage } from "firebase/messaging";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import axios from "axios";

import { messaging, db } from "@gds-si/shared-stores";
import {
  MessagingState,
  Message,
  ChatConversation,
  MessagingUser,
} from "@gds-si/shared-types";

import { useAuthStore, useUserDataStore } from "@gds-si/shared-stores";

export const useMessagingStore = create<MessagingState>()((set, get) => ({
  messages: [],
  conversations: [],
  currentConversation: null,
  fcmToken: null,
  isLoading: false,
  error: null,
  users: [],

  setMessages: (messages: Message[]) => set({ messages }),

  addMessage: (message: Message) => {
    const { messages } = get();
    set({ messages: [message, ...messages] });
  },

  setConversations: (conversations: ChatConversation[]) =>
    set({ conversations }),

  setCurrentConversation: (conversationId: string | null) =>
    set({ currentConversation: conversationId }),

  setFcmToken: (token: string | null) => set({ fcmToken: token }),

  setUsers: (users: MessagingUser[]) => set({ users }),

  initializeMessaging: async () => {
    set({ isLoading: true, error: null });

    try {
      const { userID } = useAuthStore.getState();
      if (!userID) {
        throw new Error("Usuario no autenticado");
      }

      if (messaging) {
        try {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            let token;
            try {
              token = await getToken(messaging, {
                vapidKey:
                  "BAJYaYfds02mXOkdWlg70vxOY0QgRQCtLNk6Iejujg8qHzJXEJulfsTTlYugPw67sGJEz18KpfrOs410EeC3HYg",
              });
            } catch (vapidError) {
              try {
                token = await getToken(messaging);
              } catch (fallbackError) {
                console.error("Failed to get token:", fallbackError);
                throw fallbackError;
              }
            }

            if (token) {
              set({ fcmToken: token });

              // Save token to user profile
              const authToken = await useAuthStore.getState().getAuthToken();
              if (authToken) {
                await axios.post(
                  "/api/messaging/save-fcm-token",
                  {
                    token,
                    userID,
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${authToken}`,
                    },
                  }
                );
              }
            }
          }
        } catch (error) {
          console.error("Error getting FCM token:", error);
        }

        onMessage(messaging, (payload) => {
          if (payload.notification) {
            new Notification(payload.notification.title || "Nuevo mensaje", {
              body: payload.notification.body,
              icon: "/icon-192.png",
            });
          }

          if (payload.data?.type === "chat") {
            const message: Message = JSON.parse(payload.data.message);
            get().addMessage(message);
          }
        });
      }

      // Fetch conversations
      await get().fetchConversations();

      set({ isLoading: false });
    } catch (error) {
      console.error("Error initializing messaging:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Error al inicializar messaging",
        isLoading: false,
      });
    }
  },

  sendMessage: async (receiverId: string, content: string) => {
    try {
      const { userID } = useAuthStore.getState();
      const { userData } = useUserDataStore.getState();

      if (!userID || !userData) {
        throw new Error("Usuario no autenticado");
      }

      const messageData = {
        senderId: userID,
        senderName: `${userData.firstName} ${userData.lastName}`,
        senderEmail: userData.email || "",
        receiverId,
        content,
        timestamp: new Date().toISOString(),
        read: false,
        type: "text" as const,
      };

      const authToken = await useAuthStore.getState().getAuthToken();
      if (!authToken) {
        throw new Error("No auth token available");
      }

      const response = await axios.post(
        "/api/messaging/send-message",
        {
          ...messageData,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      // Soporte para formato nuevo { success, data } y antiguo
      const result = response.data?.data ?? response.data;
      const message: Message = {
        id: result.messageId,
        ...messageData,
      };

      get().addMessage(message);
    } catch (error) {
      console.error("Error sending message:", error);
      set({
        error:
          error instanceof Error ? error.message : "Error enviando mensaje",
      });
    }
  },

  fetchMessages: async (otherUserId: string) => {
    set({ isLoading: true, error: null });

    try {
      const { userID } = useAuthStore.getState();
      if (!userID) {
        throw new Error("Usuario no autenticado");
      }

      const conversationId = [userID, otherUserId].sort().join("_");
      const messagesRef = collection(db, "messages");
      const q = query(
        messagesRef,
        where("conversationId", "==", conversationId),
        orderBy("timestamp", "desc")
      );

      onSnapshot(q, (snapshot) => {
        const messages: Message[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          messages.push({
            id: doc.id,
            ...data,
            timestamp:
              data.timestamp?.toDate?.() ||
              new Date(data.createdAt || Date.now()),
          } as Message);
        });

        set({ messages, isLoading: false });
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      set({
        error:
          error instanceof Error ? error.message : "Error cargando mensajes",
        isLoading: false,
      });
    }
  },

  fetchConversations: async (includeCurrentUser = false) => {
    try {
      const { userID } = useAuthStore.getState();
      if (!userID) {
        throw new Error("Usuario no autenticado");
      }

      const authToken = await useAuthStore.getState().getAuthToken();
      if (!authToken) {
        throw new Error("No auth token available");
      }

      const url = includeCurrentUser
        ? "/api/messaging/users?includeCurrentUser=true"
        : "/api/messaging/users";

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      // Soporte para formato nuevo { success, data } y antiguo
      const result = response.data?.data ?? response.data;
      const users: MessagingUser[] = includeCurrentUser
        ? result.users
        : result.users.filter((u: MessagingUser) => u.uid !== userID);

      set({ users });
    } catch (error) {
      console.error("Error fetching conversations:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Error cargando conversaciones",
      });
    }
  },

  markMessageAsRead: async (messageId: string) => {
    try {
      const messageRef = doc(db, "messages", messageId);
      await updateDoc(messageRef, {
        read: true,
      });
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  },
}));
