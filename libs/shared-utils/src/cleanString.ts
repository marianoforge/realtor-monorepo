export const cleanString = (str: string) => {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
};
