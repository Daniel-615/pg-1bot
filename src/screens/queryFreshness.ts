export function formatLastRequestAt(timestamp: number) {
    if (!timestamp) {
        return "Sin petición registrada";
    }

    return new Intl.DateTimeFormat("es", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(timestamp));
}
