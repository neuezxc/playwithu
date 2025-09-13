export function resetCommand(user, character, setUser, setCharacter) {
  const command = user.message.trim().toLowerCase();

  if (command === "/reset") {
    const resetMessages = character.messages
      .slice(0, 2)
      .filter((msg) => msg.role === "system" || msg.role === "assistant");

    setCharacter({ ...character, messages: resetMessages });
    setUser({ ...user, message: "" });
    console.log("Conversation reset");
  } else if (command === "/summarize") {
    console.log("summarize");
  }

  return;
}
