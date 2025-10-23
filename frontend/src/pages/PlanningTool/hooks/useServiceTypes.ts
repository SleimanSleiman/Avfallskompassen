/**
 * Custom hook to fetch and return service types from the API.
 */
import { useState, useEffect } from "react";
import { fetchServiceTypes } from "../../../lib/serviceType";

export function useServiceTypes() {
    /* ──────────────── Service Types state ──────────────── */
    const [serviceTypes, setServiceTypes] = useState<{ id: number; name: string }[]>([]);

    /* ──────────────── Fetch Service Types on mount ──────────────── */
    useEffect(() => {
        fetchServiceTypes()
            .then(setServiceTypes)
            .catch((err) => console.error(err));
    }, []);

    /* ──────────────── Return ──────────────── */
    return serviceTypes;
}