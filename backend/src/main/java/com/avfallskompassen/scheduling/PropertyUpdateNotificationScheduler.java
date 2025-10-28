package com.avfallskompassen.scheduling;

import com.avfallskompassen.model.Property;
import com.avfallskompassen.repository.PropertyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduled job that checks properties and marks them as notified when
 * one year has passed since creation or last update.
 */
@Component
public class PropertyUpdateNotificationScheduler {

    private static final Logger log = LoggerFactory.getLogger(PropertyUpdateNotificationScheduler.class);

    private final PropertyRepository propertyRepository;

    // configurable threshold (seconds) - default to one year (approx)
    @Value("${notification.threshold.seconds:31536000}")
    private long thresholdSeconds;

    @Autowired
    public PropertyUpdateNotificationScheduler(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    /**
     * Runs once a day at 02:00 AM server time. Finds properties where
     * the last change (createdAt or updatedAt) is >= 1 year ago and the
     * property hasn't been notified since that change.
     */
    // (default: daily at 02:00)
    @Scheduled(cron = "${notification.cron:0 0 2 * * *}")
    public void runDailyNotificationCheck() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threshold = now.minusSeconds(thresholdSeconds);

        List<Property> all = propertyRepository.findAll();
        int notified = 0;

        for (Property p : all) {
            LocalDateTime lastChange = p.getUpdatedAt() != null ? p.getUpdatedAt() : p.getCreatedAt();
            if (lastChange == null) {
                // shouldn't happen but guard
                continue;
            }

            boolean needsNotification = lastChange.isBefore(threshold) &&
                    (p.getLastNotifiedAt() == null || p.getLastNotifiedAt().isBefore(lastChange));

            if (needsNotification) {
                
                // Use a JPQL update to avoid triggering entity validation on other fields
                try {
                    int updated = propertyRepository.updateLastNotifiedAt(p.getId(), now);
                    if (updated > 0) {
                        notified++;
                        log.info("Marked property(id={}) as notified for yearly update reminder. lastChange={}", p.getId(), lastChange);
                    } else {
                        log.warn("Failed to mark property(id={}) as notified — update returned 0 rows.", p.getId());
                    }
                } catch (Exception ex) {
                    // Log and continue with other properties — don't let one bad row stop the job
                    log.error("Failed to update lastNotifiedAt for property(id={}), skipping. Reason: {}", p.getId(), ex.getMessage(), ex);
                }
            }
        }

        log.info("Property update notification run completed. {} properties marked as notified.", notified);
    }
}
