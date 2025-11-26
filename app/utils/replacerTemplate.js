export const promptVariables = [
  "{{char}}",
  "{{user}}",
  "{{char_description}}",
  "{{user_description}}",
  "{{scenario}}",
  "{{memory}}",
  "{{tools}}",
];

export function replacePlaceholders(template, values) {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    const placeholder = `{{${key}}}`;
    result = result.replaceAll(placeholder, value || "");
  }
  return result;
}