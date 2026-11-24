export const taka = (value) => `৳${Number(value || 0).toLocaleString("en-BD")}`;

export const to12h = (time = "") => {
    const [h, m] = time.split(":").map(Number);
    if (Number.isNaN(h)) return time;
    return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

export const DAYS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

// Our week starts on Saturday; JS getDay(): Sun=0 … Sat=6
export const todayCode = () => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];

export const EVENT_TYPES = {
    academic: { label: "Academic", color: "blue" },
    exam: { label: "Exam", color: "red" },
    holiday: { label: "Holiday", color: "green" },
    event: { label: "Campus event", color: "amber" },
};
