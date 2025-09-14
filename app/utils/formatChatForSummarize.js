export const formatChatForSummarize = (messages) => {
    const formattedOutput = messages
      .filter((msg) => msg.role !== "system")
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");
    return formattedOutput;
  };
