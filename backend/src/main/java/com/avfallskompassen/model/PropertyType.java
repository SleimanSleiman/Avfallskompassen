package com.avfallskompassen.model;

/**
 * Enum representing the type of property.
 * Used for comparison of similar properties.
 * 
 * @author Sleiman Sleiman
 */
public enum PropertyType {
    FLERBOSTADSHUS("Flerbostadshus"),
    SMAHUS("Småhus"),
    VERKSAMHET("Verksamhet");
    
    private final String displayName;
    
    PropertyType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
