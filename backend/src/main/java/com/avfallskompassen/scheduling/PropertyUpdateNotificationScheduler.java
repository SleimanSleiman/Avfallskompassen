package com.avfallskompassen.scheduling;

import com.avfallskompassen.model.Property;
import com.avfallskompassen.repository.PropertyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Scheduled job that checks properties and marks them as notified when
 * one year has passed since creation or last update.
 *
 * NOTE: This implementation simply updates the property's lastNotifiedAt
 * field and logs the action. Integrate with your real notification
 * delivery (email, in-app, push) when available.
 */
@Component
public class PropertyUpdateNotificationScheduler {

    private static final Logger log = LoggerFactory.getLogger(PropertyUpdateNotificationScheduler.class);

    private final PropertyRepository propertyRepository;

    @Autowired
    public PropertyUpdateNotificationScheduler(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    /**
     * Runs once a day at 02:00 AM server time. Finds properties where
     * the last change (createdAt or updatedAt) is >= 1 year ago and the
     * property hasn't been notified since that change.
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void runDailyNotificationCheck() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threshold = now.minus(1, ChronoUnit.YEARS);

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
                // integrate real notification sending (email/in-app) here.
                // For now, mark lastNotifiedAt and save.
                p.setLastNotifiedAt(now);
                propertyRepository.save(p);
                notified++;
                log.info("Marked property(id={}) as notified for yearly update reminder. lastChange={}", p.getId(), lastChange);
            }
        }

        log.info("Property update notification run completed. {} properties marked as notified.", notified);
    }
}
