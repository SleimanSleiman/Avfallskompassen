package com.avfallskompassen.services;

import com.avfallskompassen.dto.CollectionFrequencyComparisonDTO;
import com.avfallskompassen.dto.ContainerSizeComparisonDTO;
import com.avfallskompassen.dto.CostComparisonDTO;
import com.avfallskompassen.dto.GeneralPropertyCostDTO;
import com.avfallskompassen.dto.PropertyComparisonDTO;
import com.avfallskompassen.dto.WasteAmountComparisonDTO;
import com.avfallskompassen.model.ContainerPlan;
import com.avfallskompassen.model.ContainerPosition;
import com.avfallskompassen.model.ContainerType;
import com.avfallskompassen.model.Municipality;
import com.avfallskompassen.model.MunicipalityService;
import com.avfallskompassen.model.Property;
import com.avfallskompassen.model.PropertyType;
import com.avfallskompassen.model.ServiceType;
import com.avfallskompassen.model.WasteRoom;
import com.avfallskompassen.repository.WasteRoomRepository;
import com.avfallskompassen.repository.PropertyRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

class PropertyComparisonServiceTest {

	private static final long PROPERTY_ID = 1L;
	private static final long SIMILAR_ID = 2L;
	private static final long SECOND_SIMILAR_ID = 3L;

	@Mock
	private PropertyRepository propertyRepository;

	@Mock
	private PropertyCostService propertyCostService;

	@Mock
	private WasteRoomRepository wasteRoomRepository;

	@InjectMocks
	private PropertyComparisonService propertyComparisonService;

	private Property property;
	private Property similarProperty;
	private Property secondSimilarProperty;

	private WasteRoom propertyWasteRoom;
	private WasteRoom similarWasteRoom;
	private WasteRoom secondSimilarWasteRoom;

	private GeneralPropertyCostDTO propertyCostDto;
	private GeneralPropertyCostDTO similarCostDto;
	private GeneralPropertyCostDTO secondSimilarCostDto;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);

		Municipality municipality = new Municipality();
		municipality.setId(10L);
		municipality.setName("Testkommun");

		property = createProperty(PROPERTY_ID, "Centralgatan 1", 10, municipality);
		similarProperty = createProperty(SIMILAR_ID, "Centralgatan 3", 8, municipality);
		secondSimilarProperty = createProperty(SECOND_SIMILAR_ID, "Centralgatan 5", 12, municipality);

		propertyWasteRoom = new WasteRoom();
		propertyWasteRoom.setProperty(property);
		propertyWasteRoom.setIsActive(true);
		propertyWasteRoom.setContainers(new ArrayList<>());
		addContainersToRoom(propertyWasteRoom, "Restavfall", 100, 10, 1);
		addContainersToRoom(propertyWasteRoom, "Matavfall", 50, 12, 1);

		similarWasteRoom = new WasteRoom();
		similarWasteRoom.setProperty(similarProperty);
		similarWasteRoom.setIsActive(true);
		similarWasteRoom.setContainers(new ArrayList<>());
		addContainersToRoom(similarWasteRoom, "Restavfall", 125, 8, 1);

		secondSimilarWasteRoom = new WasteRoom();
		secondSimilarWasteRoom.setProperty(secondSimilarProperty);
		secondSimilarWasteRoom.setIsActive(true);
		secondSimilarWasteRoom.setContainers(new ArrayList<>());
		addContainersToRoom(secondSimilarWasteRoom, "Restavfall", 90, 6, 1);


		propertyCostDto = new GeneralPropertyCostDTO(
			property.getAddress(),
			new BigDecimal("1000.00"),
			new BigDecimal("100.00")
		);

		similarCostDto = new GeneralPropertyCostDTO(
			similarProperty.getAddress(),
			new BigDecimal("1500.00"),
			new BigDecimal("150.00")
		);

		secondSimilarCostDto = new GeneralPropertyCostDTO(
			secondSimilarProperty.getAddress(),
			new BigDecimal("1800.00"),
			new BigDecimal("180.00")
		);
	}

	@Test
	void getPropertyComparison_ShouldReturnAggregatedMetrics() {
		mockSingleSimilarScenario();

		PropertyComparisonDTO result = propertyComparisonService.getPropertyComparison(PROPERTY_ID);

		assertNotNull(result);
		assertNotNull(result.getWasteAmountComparisons());
		assertNotNull(result.getFrequencyComparisons());
		assertNotNull(result.getContainerSizeComparison());
		assertNotNull(result.getCostComparison());
	}

	@Test
	void getPropertyComparison_ShouldHandleMultipleSimilarProperties() {
		mockMultipleSimilarScenario();

		PropertyComparisonDTO result = propertyComparisonService.getPropertyComparison(PROPERTY_ID);
		assertNotNull(result);

		CostComparisonDTO cost = result.getCostComparison();
       
		assertNotNull(cost.getPropertyCost());
		assertNotNull(cost.getAverageCost());
	}

	@Test
	void getPropertyComparison_ShouldThrowIfPropertyNotFound() {
		when(propertyRepository.findById(999L)).thenReturn(Optional.empty());
		assertThrows(EntityNotFoundException.class,
			() -> propertyComparisonService.getPropertyComparison(999L));
	}

	@Test
	void getCostComparison_ShouldReturnSingleMetric() {
		mockSingleSimilarScenario();

		CostComparisonDTO result = propertyComparisonService.getCostComparison(PROPERTY_ID);

		assertEquals(propertyCostDto.getTotalCost(), result.getPropertyCost());
		// Average of Property(1000) + Similar(1500) = 1250
		assertEquals(new BigDecimal("1250.00"), result.getAverageCost());
		
	}

	@Test
	void getContainerSizeComparison_ShouldReturnContainerMetrics() {
		mockSingleSimilarScenario();

		ContainerSizeComparisonDTO result = propertyComparisonService.getContainerSizeComparison(PROPERTY_ID);

		assertEquals(150, result.getPropertyTotalVolume());
		// (150 + 125) / 2 = 137.5
		assertEquals(137.5, result.getAverageVolume(), 0.01);
		assertEquals("lika stora", result.getComparison());
	}

	@Test
	void getWasteAmountComparisons_ShouldReturnPerServiceBreakdown() {
		mockSingleSimilarScenario();

		List<WasteAmountComparisonDTO> result = propertyComparisonService.getWasteAmountComparisons(PROPERTY_ID);

		assertEquals(2, result.size());
		WasteAmountComparisonDTO rest = findWasteEntry(result, "Restavfall");
		assertEquals(1000.0, rest.getPropertyWasteAmount(), 0.01);
		assertEquals(1000.0, rest.getAverageWasteAmount(), 0.01);
		assertEquals(1, rest.getComparisonGroupSize());

		WasteAmountComparisonDTO mat = findWasteEntry(result, "Matavfall");
		assertEquals(600.0, mat.getPropertyWasteAmount(), 0.01);
		assertEquals(600.0, mat.getAverageWasteAmount(), 0.01);
		assertEquals(0, mat.getComparisonGroupSize());
	}

	@Test
	void getFrequencyComparisons_ShouldReturnCollectionFrequencyPerService() {
		mockSingleSimilarScenario();

		List<CollectionFrequencyComparisonDTO> result = propertyComparisonService.getFrequencyComparisons(PROPERTY_ID);

		assertEquals(2, result.size());
		CollectionFrequencyComparisonDTO rest = findFrequencyEntry(result, "Restavfall");
		assertEquals(10, rest.getPropertyFrequency());
		assertEquals(8.0, rest.getAverageFrequency(), 0.01);
		assertEquals(25.0, rest.getPercentageDifference(), 0.01);
		assertEquals(1, rest.getComparisonGroupSize());

		CollectionFrequencyComparisonDTO mat = findFrequencyEntry(result, "Matavfall");
		assertEquals(12, mat.getPropertyFrequency());
		assertEquals(12.0, mat.getAverageFrequency(), 0.01);
		assertEquals(0.0, mat.getPercentageDifference(), 0.01);
		assertEquals(0, mat.getComparisonGroupSize());
	}

	@Test
	void getPropertyComparison_ShouldAggregateAcrossMultipleSimilarProperties() {
		when(propertyRepository.findById(PROPERTY_ID)).thenReturn(Optional.of(property));
		when(propertyRepository.findSimilarProperties(any(), any(), anyInt(), anyInt(), eq(PROPERTY_ID)))
			.thenReturn(List.of(similarProperty, secondSimilarProperty));

		when(propertyCostService.calculateAnnualCost(PROPERTY_ID)).thenReturn(propertyCostDto);
		when(propertyCostService.calculateAnnualCost(SIMILAR_ID)).thenReturn(similarCostDto);
		when(propertyCostService.calculateAnnualCost(SECOND_SIMILAR_ID)).thenReturn(secondSimilarCostDto);

		when(wasteRoomRepository.findByPropertyId(PROPERTY_ID)).thenReturn(List.of(propertyWasteRoom));
		when(wasteRoomRepository.findByPropertyIdIn(anyCollection()))
			.thenReturn(List.of(similarWasteRoom, secondSimilarWasteRoom));

		PropertyComparisonDTO result = propertyComparisonService.getPropertyComparison(PROPERTY_ID);

		CostComparisonDTO cost = result.getCostComparison();
		assertEquals(3, cost.getComparisonGroupSize());
		assertEquals(new BigDecimal("1433.33"), cost.getAverageCost());

		ContainerSizeComparisonDTO containerSize = result.getContainerSizeComparison();
		assertEquals(150, containerSize.getPropertyTotalVolume());
		assertEquals(121.67, containerSize.getAverageVolume(), 0.01);
		assertEquals("större", containerSize.getComparison());
		assertEquals(3, containerSize.getComparisonGroupSize());

		WasteAmountComparisonDTO restWaste = findWasteEntry(result.getWasteAmountComparisons(), "Restavfall");
		assertEquals(2, restWaste.getComparisonGroupSize());
		assertEquals(1000.0, restWaste.getPropertyWasteAmount(), 0.01);
		// (1000 + 540) / 2 = 770.0 (Average of Similar Only)
		assertEquals(770.0, restWaste.getAverageWasteAmount(), 0.01);
		assertEquals(540.0, restWaste.getMinWasteAmount(), 0.01);
		assertEquals(1000.0, restWaste.getMaxWasteAmount(), 0.01);
		// (1000 - 770) / 770 * 100 = 29.87%
		assertEquals(29.87, restWaste.getPercentageDifference(), 0.01);

		CollectionFrequencyComparisonDTO restFrequency = findFrequencyEntry(result.getFrequencyComparisons(), "Restavfall");
		assertEquals(2, restFrequency.getComparisonGroupSize());
		assertEquals(10, restFrequency.getPropertyFrequency());
		// (8 + 6) / 2 = 7.0 (Average of Similar Only)
		assertEquals(7.0, restFrequency.getAverageFrequency(), 0.01);
		// (10 - 7) / 7 * 100 = 42.86%
		assertEquals(42.86, restFrequency.getPercentageDifference(), 0.01);
	}

	// --- Helpers ---

	private void mockSingleSimilarScenario() {
		when(propertyRepository.findById(PROPERTY_ID)).thenReturn(Optional.of(property));
		
		when(propertyRepository.findSimilarProperties(
			any(PropertyType.class), any(Municipality.class), anyInt(), anyInt(), eq(PROPERTY_ID)
		)).thenReturn(List.of(similarProperty));

		when(wasteRoomRepository.findByPropertyId(PROPERTY_ID)).thenReturn(List.of(propertyWasteRoom));
		when(wasteRoomRepository.findByPropertyIdIn(anyCollection())).thenReturn(List.of(similarWasteRoom));

		when(propertyCostService.calculateAnnualCost(PROPERTY_ID)).thenReturn(propertyCostDto);
		when(propertyCostService.calculateAnnualCost(SIMILAR_ID)).thenReturn(similarCostDto);
	}

	private void mockMultipleSimilarScenario() {
		when(propertyRepository.findById(PROPERTY_ID)).thenReturn(Optional.of(property));

		when(propertyRepository.findSimilarProperties(
			any(PropertyType.class), any(Municipality.class), anyInt(), anyInt(), eq(PROPERTY_ID)
		)).thenReturn(List.of(similarProperty, secondSimilarProperty));

		when(wasteRoomRepository.findByPropertyId(PROPERTY_ID)).thenReturn(List.of(propertyWasteRoom));
		when(wasteRoomRepository.findByPropertyIdIn(anyCollection())).thenReturn(List.of(similarWasteRoom, secondSimilarWasteRoom));

		when(propertyCostService.calculateAnnualCost(PROPERTY_ID)).thenReturn(propertyCostDto);
		when(propertyCostService.calculateAnnualCost(SIMILAR_ID)).thenReturn(similarCostDto);
		when(propertyCostService.calculateAnnualCost(SECOND_SIMILAR_ID)).thenReturn(secondSimilarCostDto);
	}

	private Property createProperty(Long id, String address, int apartments, Municipality municipality) {
		Property p = new Property();
		p.setId(id);
		p.setAddress(address);
		p.setNumberOfApartments(apartments);
		p.setMunicipality(municipality);
		p.setPropertyType(PropertyType.FLERBOSTADSHUS);
		return p;
	}

	private void addContainersToRoom(WasteRoom room, String serviceName, int volume, int freq, int count) {
		ServiceType st = new ServiceType();
		st.setName(serviceName);

		MunicipalityService ms = new MunicipalityService();
		ms.setServiceType(st);

		ContainerType ct = new ContainerType();
		ct.setSize(volume);

		ContainerPlan cp = new ContainerPlan();
		cp.setMunicipalityService(ms);
		cp.setContainerType(ct);
		cp.setEmptyingFrequencyPerYear(freq);

		for(int i=0; i<count; i++) {
			ContainerPosition pos = new ContainerPosition();
			pos.setContainerPlan(cp);
			pos.setWasteRoom(room);
			room.getContainers().add(pos);
		}
	}
	
	private WasteAmountComparisonDTO findWasteEntry(List<WasteAmountComparisonDTO> entries, String wasteType) {
		return entries.stream()
			.filter(entry -> wasteType.equals(entry.getWasteType()))
			.findFirst()
			.orElseThrow(() -> new AssertionError("Missing waste entry for " + wasteType));
	}

	private CollectionFrequencyComparisonDTO findFrequencyEntry(List<CollectionFrequencyComparisonDTO> entries, String wasteType) {
		return entries.stream()
			.filter(entry -> wasteType.equals(entry.getWasteType()))
			.findFirst()
			.orElseThrow(() -> new AssertionError("Missing frequency entry for " + wasteType));
	}
}
