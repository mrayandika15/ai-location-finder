import React from "react";
import { useMutation } from "@tanstack/react-query";
import { createOpenWebUIService } from "../services/ai.service.api";
import {
  type AIServiceResponse,
  type CompleteMessageRequest,
  type CompleteMessageResponse,
} from "../types/ai.types";

const useCompleteCompletion = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: AIServiceResponse<CompleteMessageResponse>) => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation({
    mutationFn: async (request: CompleteMessageRequest) => {
      const aiService = createOpenWebUIService();
      const response = await aiService.completeMessage(request);
      return response;
    },
    onSuccess: (data) => {
      console.log("Complete completion completed successfully:", data);
      onSuccess?.(data);
    },
    onError: (error) => {
      console.error("Complete completion failed:", error);
      onError?.(error);
    },
  });
};

export default useCompleteCompletion;
