import { useState } from "react";
import type { OpenWebUIMessage } from "../types";

const useHandleMessage = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [message, setMessage] = useState<OpenWebUIMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI location assistant. Ask me anything like 'Find coffee shops near ITB' or 'Where can I get good ramen in Bandung?'",
      timestamp: Date.now(),
    },
  ]);

  return {
    prompt,
    setPrompt,
    message,
    setMessage,
  };
};

export default useHandleMessage;
