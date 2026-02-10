export const formatDate = (date: string | null) => {
  if (!date) return "Fecha inválida";

  try {
    const [year, month, day] = date.split("-");

    return `${day}/${month}/${year.slice(-2)}`;
  } catch (error) {
    console.error("Error formateando la fecha:", error);
    return "Fecha inválida";
  }
};
