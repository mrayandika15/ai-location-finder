import { useMutation } from "@tanstack/react-query";
import { createOpenWebUIService } from "../services/ai.service.api";
import type {
  CreateChatRequest,
  EditChatRequest,
  OpenWebUIChatResponse,
  OpenWebUIMessage,
} from "../types/ai.types";

interface UseCreateNewAIMessageReturn {
  createNewAIMessage: (message: string) => Promise<OpenWebUIChatResponse>;
  isLoading: boolean;
  isError: boolean;
  error: any;
  data: OpenWebUIChatResponse | null;
  isSuccess: boolean;
}

const useCreateNewAIMessage = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: OpenWebUIChatResponse) => void;
  onError?: (error: Error) => void;
}): UseCreateNewAIMessageReturn => {
  const aiService = createOpenWebUIService();

  const mutation = useMutation({
    mutationFn: async (message: string) => {
      console.log("Starting AI Location Finder flow for message:", message);

      // Step 1: Create new chat with user message
      const createChatRequest: CreateChatRequest = {
        title: "AI Location Finder Chat",
        userMessage: message,
        models: ["gemma3:1b"], // Default model, should be configurable
        sessionId: `session_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
      };

      console.log("Step 1: Creating chat...");
      const createResponse = await aiService.createChat(createChatRequest);

      if (!createResponse.success || !createResponse.data) {
        throw new Error(
          createResponse.error?.message || "Failed to create chat"
        );
      }

      const chatId = createResponse.data.id;
      const userMessage = createResponse.data.chat.messages[0];

      console.log("Step 1 completed. Chat ID:", chatId);

      // Step 2: Create assistant message and edit chat
      const assistantMessage: OpenWebUIMessage = {
        id: `assistant_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        role: "assistant",
        content: "", // Empty content initially
        parentId: userMessage.id,
        modelName: createResponse.data.chat.models[0],
        modelIdx: 0,
        timestamp: Date.now(),
      };

      // Enrich the chat with assistant message
      const enrichedChat = {
        ...createResponse.data.chat,
        messages: [...createResponse.data.chat.messages, assistantMessage],
        history: {
          ...createResponse.data.chat.history,
          current_id: assistantMessage.id,
          messages: {
            ...createResponse.data.chat.history.messages,
            [assistantMessage.id]: assistantMessage,
          },
        },
      };

      const editChatRequest: EditChatRequest = {
        chatId,
        chat: enrichedChat,
      };

      console.log("Step 2: Editing chat with assistant message...");
      const editResponse = await aiService.editChat(editChatRequest);

      if (!editResponse.success || !editResponse.data) {
        throw new Error(editResponse.error?.message || "Failed to edit chat");
      }

      console.log(
        "Step 2 completed. Assistant message ID:",
        assistantMessage.id
      );

      return editResponse.data;
    },
    onSuccess: (data) => {
      console.log("AI Location Finder flow completed successfully:", data);
      onSuccess?.(data);
    },
    onError: (error) => {
      console.error("AI Location Finder flow failed:", error);
      onError?.(error);
    },
  });

  return {
    createNewAIMessage: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data || null,
    isSuccess: mutation.isSuccess,
  };
};

export default useCreateNewAIMessage;
