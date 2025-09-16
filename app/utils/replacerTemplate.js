
// Add this helper function at the top of your file

export function replacePlaceholders(template, values) {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    const placeholder = `{{${key}}}`;
    result = result.replaceAll(placeholder, value || '');
  }
  return result;
}
