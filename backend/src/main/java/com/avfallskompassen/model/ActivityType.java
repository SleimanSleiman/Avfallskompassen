package com.avfallskompassen.model;

/**
 * Enum with the different types of {@link Activity} done by users that are to be saved
 * @author Anton Persson
 */
public enum ActivityType {
    LOGIN,
    REGISTERED,
    CREATED_PROPERTY,
    CHANGED_PROPERTY,
    DELETED_PROPERTY,
    CREATED_WASTEROOM,
    CREATED_VERSION,
    SAVED_WASTEROOM,
    UPDATED_WASTEROOM,
    DELETED_WASTEROOM,
    CHANGED_ROLE,
    CHANGED_PASSWORD,
    EXPORTED_CALCULATEDCOST_PDF,
    ADMIN_SAVED_VERSION_OF_WASTE_ROOM
}
