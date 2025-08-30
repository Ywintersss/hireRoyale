export const normalizeNulls = (obj: any) => {
    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key, value ?? ""])
    );
}

export const normalizeCommaSeparated = (input: string) => {
    if (!input) return "";
    if (input.trim() === "" || input.trim() === ",") return "";
    if (!input.includes(",")) return "";

    return input
        .split(",")              // split on commas
        .map(part => part.trim()) // remove surrounding spaces
        .filter(Boolean)          // remove empty parts (if any)
        .join(",");         
}