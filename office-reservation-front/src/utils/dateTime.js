const pad = (value) => String(value).padStart(2, "0");

export const toDateTimeInputValue = (value) => {
  if (!value) return "";

  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, minute = 0] = value;
    if (!year || !month || !day) return "";
    return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}`;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
  }

  if (typeof value === "string") {
    return value.replace(" ", "T").slice(0, 16);
  }

  return "";
};

export const formatReservationTime = (value) =>
  toDateTimeInputValue(value).replace("T", " ");
