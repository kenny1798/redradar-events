// utils/date.js (atau letak dalam file page terus)
const TZ = "Asia/Kuala_Lumpur";
const fmtFull = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: TZ,
});

export function safeFormat(dateInput) {
  const d = new Date(dateInput);
  return isNaN(d.getTime()) ? "-" : fmtFull.format(d);
}
