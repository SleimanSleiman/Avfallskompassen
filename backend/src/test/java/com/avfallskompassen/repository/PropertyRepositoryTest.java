package com.avfallskompassen.repository;

import com.avfallskompassen.model.LockType;
import com.avfallskompassen.model.Municipality;
import com.avfallskompassen.model.Property;
import com.avfallskompassen.model.PropertyType;
import com.avfallskompassen.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest(properties = {
    "spring.flyway.enabled=false",
    "spring.liquibase.enabled=false",
    "spring.sql.init.mode=never"
})
@AutoConfigureTestDatabase(replace = Replace.ANY)
public class PropertyRepositoryTest {

    @Autowired
    private TestEntityManager em;

    @Autowired
    private PropertyRepository propertyRepository;

    private LockType createLock(String name) {
        LockType l = new LockType();
        l.setName(name);
        l.setCost(new BigDecimal("10.00"));
        return em.persistFlushFind(l);
    }

    private Municipality createMunicipality(String name) {
        Municipality m = new Municipality();
        m.setName(name);
        return em.persistFlushFind(m);
    }

    private User createUser(String username) {
        User u = new User(username, "pwd");
        return em.persistFlushFind(u);
    }

    private Property createProperty(String address, Integer apartments, LockType lock, PropertyType type, Municipality mun, User user, Double accessPathLength) {
        Property p = new Property(address, apartments, lock, type, accessPathLength, user);
        p.setMunicipality(mun);
        return em.persistFlushFind(p);
    }

    @Test
    void findByAddress_and_existsByAddress_work() {
        LockType lock = createLock("L-A");
        Municipality mun = createMunicipality("M1");
        User u = createUser("u1");

        Property p = createProperty("My Address", 4, lock, PropertyType.SMAHUS, mun, u, 1.0);

        Optional<Property> found = propertyRepository.findByAddress("My Address");
        assertTrue(found.isPresent());
        assertEquals(p.getId(), found.get().getId());

        assertTrue(propertyRepository.existsByAddress("My Address"));
        assertFalse(propertyRepository.existsByAddress("Nope"));
    }

    @Test
    void findByLockType_returnsMatchingProperties() {
        LockType l1 = createLock("L1");
        LockType l2 = createLock("L2");
        Municipality mun = createMunicipality("M2");
        User u = createUser("user2");

        Property p1 = createProperty("A1", 2, l1, PropertyType.FLERBOSTADSHUS, mun, u, 0.5);
        Property p2 = createProperty("A2", 3, l2, PropertyType.FLERBOSTADSHUS, mun, u, 0.5);

        List<Property> byL1 = propertyRepository.findByLockType(l1);
        assertEquals(1, byL1.size());
        assertEquals(p1.getId(), byL1.get(0).getId());

        List<Property> byL2 = propertyRepository.findByLockType(l2);
        assertEquals(1, byL2.size());
        assertEquals(p2.getId(), byL2.get(0).getId());
    }

    @Test
    void findByCreatedBy_and_findByCreatedByUsername_work() {
        LockType lock = createLock("L3");
        Municipality mun = createMunicipality("M3");
        User u = createUser("creatorX");

        Property p = createProperty("CreatorAddr", 5, lock, PropertyType.VERKSAMHET, mun, u, 2.0);

        List<Property> byUser = propertyRepository.findByCreatedBy(u);
        assertEquals(1, byUser.size());
        assertEquals(p.getId(), byUser.get(0).getId());

        List<Property> byUsername = propertyRepository.findByCreatedByUsername("creatorX");
        assertEquals(1, byUsername.size());
        assertEquals(p.getId(), byUsername.get(0).getId());
    }

    @Test
    void existsByIdAndCreatedBy_behaviour() {
        LockType lock = createLock("L4");
        Municipality mun = createMunicipality("M4");
        User u = createUser("ownerY");

        Property p = createProperty("OwnedAddr", 6, lock, PropertyType.SMAHUS, mun, u, 3.0);

        assertTrue(propertyRepository.existsByIdAndCreatedBy(p.getId(), u));

        User other = createUser("otherZ");
        assertFalse(propertyRepository.existsByIdAndCreatedBy(p.getId(), other));
    }

    @Test
    void findSimilarProperties_findsCorrectMatches_and_excludesGivenId() {
        LockType lock = createLock("L5");
        Municipality munA = createMunicipality("MunA");
        Municipality munB = createMunicipality("MunB");
        User u = createUser("simUser");

        Property central = createProperty("Central", 10, lock, PropertyType.SMAHUS, munA, u, 1.0);

        Property similar1 = createProperty("Sim1", 6, lock, PropertyType.SMAHUS, munA, u, 1.0);
        Property similar2 = createProperty("Sim2", 15, lock, PropertyType.SMAHUS, munA, u, 1.0);

        Property diffMun = createProperty("OtherMun", 12, lock, PropertyType.SMAHUS, munB, u, 1.0);

        Property diffType = createProperty("OtherType", 8, lock, PropertyType.VERKSAMHET, munA, u, 1.0);

        Property outsideRange = createProperty("Outside", 20, lock, PropertyType.SMAHUS, munA, u, 1.0);

        List<Property> results = propertyRepository.findSimilarProperties(
                PropertyType.SMAHUS,
                munA,
                5, 15,
                central.getId()
        );

        assertTrue(results.stream().anyMatch(pp -> pp.getId().equals(similar1.getId())));
        assertTrue(results.stream().anyMatch(pp -> pp.getId().equals(similar2.getId())));
        assertFalse(results.stream().anyMatch(pp -> pp.getId().equals(central.getId())));
        assertFalse(results.stream().anyMatch(pp -> pp.getId().equals(diffMun.getId())));
        assertFalse(results.stream().anyMatch(pp -> pp.getId().equals(diffType.getId())));
        assertFalse(results.stream().anyMatch(pp -> pp.getId().equals(outsideRange.getId())));
    }
}