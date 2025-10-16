export const formatDateRange = (start: Date, end: Date): string => {
  if (!start || !end) return "";

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "";

  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
  };

  const formatDay = (date: Date): string => {
    const day = date.getDate();
    const suffix =
      day % 10 === 1 && day !== 11
        ? "st"
        : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
        ? "rd"
        : "th";

    const formatted = date.toLocaleDateString("en-US", options);
    return formatted.replace(/\d+/, `${day}${suffix}`);
  };

  const sameDay =
    start.getDate() === end.getDate() &&
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();

  if (sameDay) {
    return formatDay(start);
  } else {
    return `${formatDay(start)} - ${formatDay(end)}`;
  }
};
