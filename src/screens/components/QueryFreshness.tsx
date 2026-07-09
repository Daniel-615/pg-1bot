import "../../styles/QueryFreshness.css";

type QueryFreshnessProps = {
    updatedAt: number;
    isFetching?: boolean;
    label?: string;
};

function formatLastRequestAt(timestamp: number) {
    if (!timestamp) {
        return "Sin petición registrada";
    }

    return new Intl.DateTimeFormat("es", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(timestamp));
}

export function QueryFreshness({
    updatedAt,
    isFetching = false,
    label = "Última petición",
}: QueryFreshnessProps) {
    return (
        <span className="query-freshness">
            {label}: {formatLastRequestAt(updatedAt)}{isFetching ? " · actualizando" : ""}
        </span>
    );
}
