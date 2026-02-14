/**
 * Agenda Configuration Constants
 */

export const AGENDA_CONFIG = {
    // Opening hours range (7h to 19h inclusive)
    START_HOUR: 7,
    END_HOUR: 19,

    // UI Dimensions
    SLOT_HEIGHT_PX: 70,
    TIME_COLUMN_WIDTH_PX: 60,

    // Default durations (in minutes)
    DEFAULT_APPOINTMENT_DURATION: 60,

    // View types
    VIEWS: {
        DAY: "day",
        WEEK: "week",
        MONTH: "month"
    } as const
};

export const UNAVAILABILITY_TYPE_LABELS = {
    vacation: "Vacances",
    training: "Formation",
    illness: "Maladie",
    event: "Événement",
    other: "Indisponible",
} as const;
