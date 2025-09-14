import type {
  OpenWebUIChatResponse,
  ChatCompletionRequest,
  ChatCompletionResponse,
} from "../types";
import OpenWebUIService from "../services/ai.service.api";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";

const client = new OpenWebUIService();

const useStreamingCompletion = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: ChatCompletionResponse) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<ChatCompletionResponse, Error, OpenWebUIChatResponse> => {
  const processStreaming = async (
    data: OpenWebUIChatResponse
  ): Promise<ChatCompletionResponse> => {
    const streamingRequest: ChatCompletionRequest = {
      chat_id: data?.id || "",
      id: data?.chat.messages[data.chat.messages.length - 1].id || "",
      messages: data?.chat.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      model: data?.chat.models[0] || "",
      session_id: data?.chat.session_id || "",
      stream: true,
      background_tasks: {
        title_generation: true,
        tags_generation: false,
        follow_up_generation: false,
      },
      features: {
        location_finder: true,
      },
      variables: {
        location_finder: true,
      },
      filter_ids: [],
      files: [],
    };

    const streamingResponse = await client.triggerCompletion(streamingRequest);

    if (!streamingResponse.success || !streamingResponse.data) {
      throw new Error(
        streamingResponse.error?.message || "Failed to trigger completion"
      );
    }

    return streamingResponse.data;
  };

  return useMutation({
    mutationFn: async (data: OpenWebUIChatResponse) => {
      return await processStreaming(data);
    },
    onSuccess: (data) => {
      console.log("Streaming completion completed successfully:", data);

      onSuccess?.(data);
    },
    onError: (error) => {
      console.error("Streaming completion failed:", error);
      onError?.(error);
    },
  });
};

export default useStreamingCompletion;
