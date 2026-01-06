/**
 * Custom hook to fetch and return service types from the API.
 */
import { useState, useEffect } from "react";
import { fetchServiceTypes } from "../../../lib/ServiceType";
import type {ServiceType} from "../../../lib/ServiceType"

export function useServiceTypes() {
    const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);

    useEffect(() => {
        fetchServiceTypes()
            .then(setServiceTypes)
            .catch((err) => console.error(err));
    }, []);

    return serviceTypes;
}