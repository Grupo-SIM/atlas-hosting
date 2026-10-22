export const generateUsername = (name: string) => {
  return name
    .split(/[.\s]+/)
    .filter(word => word.length > 0)
    .map(word => word[0].toLowerCase())
    .join("");
};
