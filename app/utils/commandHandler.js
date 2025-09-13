export function resetCommand(user, character, setUser, setCharacter) {
  const command = user.message.trim();

  if (command.startsWith("/name")) {
    const name = command.substring("/name ".length).trim();
    if (name) {
      setCharacter({ ...character, name: name });
    }
    return;
  }
  if (command.startsWith("/avatar")) {
    const avatar = command.substring("/avatar ".length).trim();
    if (avatar) {
      setCharacter({ ...character, avatarURL: avatar });
    }
    return;
  }
  if (command.startsWith("/bio")) {
    const bio = command.substring("/bio ".length).trim();
    if (bio) {
      setCharacter({ ...character, bio: bio });
    }
    return;
  }
  if (command.startsWith("/description")) {
    const description = command.substring("/description ".length).trim();
    if (description) {
      setCharacter({ ...character, description: description });
    }
    return;
  }
  if (command.startsWith("/scenario")) {
    const scenario = command.substring("/scenario ".length).trim();
    if (scenario) {
      setCharacter({ ...character, scenario: scenario });
    }
    return;
  }
  if (command.startsWith("/fmessage")) {
    const fmessage = command.substring("/fmessage ".length).trim();
    if (fmessage) {
      console.log("Setting first message to:", fmessage); // Debug log
      setCharacter({ ...character, firstMessage: fmessage });
      console.log(character.firstMessage)
    }
    return;
  }

  const commandName = command.toLowerCase();

  if (commandName === "/reset") {
    const resetMessages = character.messages
      .slice(0, 2)
      .filter((msg) => msg.role === "system" || msg.role === "assistant");

    setCharacter({ ...character, messages: resetMessages });
    setUser({ ...user, message: "" });
    console.log("Conversation reset");
  } else if (commandName === "/summarize") {
    console.log("summarize");
  }

  return;
}
