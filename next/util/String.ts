export function TruncateAndEllipse(text: string, maxLength: number) {
  return text.length <= maxLength ? text : text.slice(0, maxLength - 3) + "...";
}

export function safeJSONParse(text: string) {
  try {
    return JSON.parse(text);
  } catch (ex) {
    return undefined;
  }
}
