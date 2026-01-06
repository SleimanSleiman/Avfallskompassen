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
import com.avfallskompassen.repository.PropertyRepository;
import com.avfallskompassen.repository.WasteRoomRepository;
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

		propertyWasteRoom = createWasteRoom(property);
		addContainerToRoom(propertyWasteRoom, "Restavfall", 100, 10);
		addContainerToRoom(propertyWasteRoom, "Matavfall", 50, 12);

		similarWasteRoom = createWasteRoom(similarProperty);
		addContainerToRoom(similarWasteRoom, "Restavfall", 125, 8);

		secondSimilarWasteRoom = createWasteRoom(secondSimilarProperty);
		addContainerToRoom(secondSimilarWasteRoom, "Restavfall", 90, 6);

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

		assertEquals(PROPERTY_ID, result.getPropertyId());
		assertEquals(property.getAddress(), result.getAddress());
		assertEquals(property.getNumberOfApartments(), result.getNumberOfApartments());
		assertEquals(property.getPropertyType().getDisplayName(), result.getPropertyType());

		// Cost (Includes self in average)
		CostComparisonDTO cost = result.getCostComparison();
		assertEquals(propertyCostDto.getTotalCost(), cost.getPropertyCost());
		assertEquals(new BigDecimal("1250.00"), cost.getAverageCost()); // (1000 + 1500) / 2
		assertEquals(new BigDecimal("1000.00"), cost.getMinCost());
		assertEquals(new BigDecimal("1500.00"), cost.getMaxCost());
		assertEquals(2, cost.getComparisonGroupSize()); // Prop + Similar
		assertEquals(-20.00, cost.getPercentageDifference(), 0.01); // (1000 - 1250) / 1250

		// Volume (Includes self in average)
		ContainerSizeComparisonDTO containerSize = result.getContainerSizeComparison();
		assertEquals(150, containerSize.getPropertyTotalVolume());
		assertEquals(137.5, containerSize.getAverageVolume(), 0.01); // (150 + 125) / 2
		assertEquals("lika stora", containerSize.getComparison());
		assertEquals(2, containerSize.getComparisonGroupSize());

		// Waste Amount (Excludes self from average, based on service impl consistency)
		List<WasteAmountComparisonDTO> waste = result.getWasteAmountComparisons();
		assertEquals(2, waste.size());
		WasteAmountComparisonDTO restWaste = findWasteEntry(waste, "Restavfall");
		assertEquals(1000.0, restWaste.getPropertyWasteAmount(), 0.01);
		assertEquals(1000.0, restWaste.getAverageWasteAmount(), 0.01);
		assertEquals(1000.0, restWaste.getMinWasteAmount(), 0.01);
		assertEquals(1000.0, restWaste.getMaxWasteAmount(), 0.01);
		assertEquals(0.0, restWaste.getPercentageDifference(), 0.01);
		assertEquals(1, restWaste.getComparisonGroupSize());

		WasteAmountComparisonDTO matWaste = findWasteEntry(waste, "Matavfall");
		assertEquals(600.0, matWaste.getPropertyWasteAmount(), 0.01);
		assertEquals(600.0, matWaste.getAverageWasteAmount(), 0.01);
		assertEquals(600.0, matWaste.getMinWasteAmount(), 0.01);
		assertEquals(600.0, matWaste.getMaxWasteAmount(), 0.01);
		assertEquals(0.0, matWaste.getPercentageDifference(), 0.01);
		assertEquals(0, matWaste.getComparisonGroupSize());

		// Frequency (Excludes self from average)
		List<CollectionFrequencyComparisonDTO> frequencies = result.getFrequencyComparisons();
		assertEquals(2, frequencies.size());
		CollectionFrequencyComparisonDTO restFrequency = findFrequencyEntry(frequencies, "Restavfall");
		assertEquals(10, restFrequency.getPropertyFrequency());
		assertEquals(8.0, restFrequency.getAverageFrequency(), 0.01);
		assertEquals(25.0, restFrequency.getPercentageDifference(), 0.01); // (10 - 8) / 8
		assertEquals(1, restFrequency.getComparisonGroupSize());

		CollectionFrequencyComparisonDTO matFrequency = findFrequencyEntry(frequencies, "Matavfall");
		assertEquals(12, matFrequency.getPropertyFrequency());
		assertEquals(12.0, matFrequency.getAverageFrequency(), 0.01);
		assertEquals(0.0, matFrequency.getPercentageDifference(), 0.01);
		assertEquals(0, matFrequency.getComparisonGroupSize());
	}

	@Test
	void getCostComparison_ShouldReturnSingleMetric() {
		mockSingleSimilarScenario();

		CostComparisonDTO result = propertyComparisonService.getCostComparison(PROPERTY_ID);

		assertEquals(propertyCostDto.getTotalCost(), result.getPropertyCost());
		assertEquals(new BigDecimal("1250.00"), result.getAverageCost());
		assertEquals(new BigDecimal("1000.00"), result.getMinCost());
		assertEquals(new BigDecimal("1500.00"), result.getMaxCost());
		assertEquals(2, result.getComparisonGroupSize());
		assertEquals(-20.00, result.getPercentageDifference(), 0.01);
	}

	@Test
	void getContainerSizeComparison_ShouldReturnContainerMetrics() {
		mockSingleSimilarScenario();

		ContainerSizeComparisonDTO result = propertyComparisonService.getContainerSizeComparison(PROPERTY_ID);

		assertEquals(150, result.getPropertyTotalVolume());
		assertEquals(137.5, result.getAverageVolume(), 0.01);
		assertEquals("lika stora", result.getComparison());
		assertEquals(2, result.getComparisonGroupSize());
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

		// Cost (1000, 1500, 1800) -> Avg 1433.33
		CostComparisonDTO cost = result.getCostComparison();
		assertEquals(3, cost.getComparisonGroupSize());
		assertEquals(new BigDecimal("1433.33"), cost.getAverageCost());
		assertEquals(new BigDecimal("1000.00"), cost.getMinCost());
		assertEquals(new BigDecimal("1800.00"), cost.getMaxCost());
		assertEquals(-30.23, cost.getPercentageDifference(), 0.01);

		// Vol (150, 125, 90) -> Avg 121.67
		ContainerSizeComparisonDTO containerSize = result.getContainerSizeComparison();
		assertEquals(150, containerSize.getPropertyTotalVolume());
		assertEquals(121.67, containerSize.getAverageVolume(), 0.01);
		assertEquals("större", containerSize.getComparison());
		assertEquals(3, containerSize.getComparisonGroupSize());

		// Waste (Sim: 1000, 2nd: 540) -> Avg 770
		WasteAmountComparisonDTO restWaste = findWasteEntry(result.getWasteAmountComparisons(), "Restavfall");
		assertEquals(2, restWaste.getComparisonGroupSize()); // Excludes self
		assertEquals(1000.0, restWaste.getPropertyWasteAmount(), 0.01);
		assertEquals(770.0, restWaste.getAverageWasteAmount(), 0.01);
		assertEquals(540.0, restWaste.getMinWasteAmount(), 0.01);
		assertEquals(1000.0, restWaste.getMaxWasteAmount(), 0.01);
		assertEquals(29.87, restWaste.getPercentageDifference(), 0.01);

		// Freq (Sim: 8, 2nd: 6) -> Avg 7
		CollectionFrequencyComparisonDTO restFrequency = findFrequencyEntry(result.getFrequencyComparisons(), "Restavfall");
		assertEquals(2, restFrequency.getComparisonGroupSize()); // Excludes self
		assertEquals(10, restFrequency.getPropertyFrequency());
		assertEquals(7.0, restFrequency.getAverageFrequency(), 0.01);
		assertEquals(42.86, restFrequency.getPercentageDifference(), 0.01);
	}

	@Test
	void getPropertyComparison_ShouldThrowWhenPropertyMissing() {
		when(propertyRepository.findById(PROPERTY_ID)).thenReturn(Optional.empty());

		assertThrows(EntityNotFoundException.class, () -> propertyComparisonService.getPropertyComparison(PROPERTY_ID));
	}

	private void mockSingleSimilarScenario() {
		when(propertyRepository.findById(PROPERTY_ID)).thenReturn(Optional.of(property));
		when(propertyRepository.findSimilarProperties(any(), any(), anyInt(), anyInt(), eq(PROPERTY_ID)))
			.thenReturn(List.of(similarProperty));

		when(propertyCostService.calculateAnnualCost(PROPERTY_ID)).thenReturn(propertyCostDto);
		when(propertyCostService.calculateAnnualCost(SIMILAR_ID)).thenReturn(similarCostDto);

		when(wasteRoomRepository.findByPropertyId(PROPERTY_ID)).thenReturn(List.of(propertyWasteRoom));
		when(wasteRoomRepository.findByPropertyIdIn(anyCollection()))
			.thenReturn(List.of(similarWasteRoom));
	}

	private Property createProperty(long id, String address, int apartments, Municipality municipality) {
		Property p = new Property();
		p.setId(id);
		p.setAddress(address);
		p.setNumberOfApartments(apartments);
		p.setPropertyType(PropertyType.FLERBOSTADSHUS);
		p.setMunicipality(municipality);
		return p;
	}

	private WasteRoom createWasteRoom(Property property) {
		WasteRoom wr = new WasteRoom();
		wr.setProperty(property);
		wr.setIsActive(true);
		wr.setContainers(new ArrayList<>());
		return wr;
	}

	private void addContainerToRoom(WasteRoom room, String serviceName, int size, int frequency) {
		ContainerType containerType = new ContainerType();
		containerType.setSize(size);

		ServiceType serviceType = new ServiceType();
		serviceType.setName(serviceName);

		MunicipalityService municipalityService = new MunicipalityService();
		municipalityService.setServiceType(serviceType);

		ContainerPlan containerPlan = new ContainerPlan();
		containerPlan.setContainerType(containerType);
		containerPlan.setMunicipalityService(municipalityService);
		containerPlan.setEmptyingFrequencyPerYear(frequency);

		ContainerPosition position = new ContainerPosition();
		position.setContainerPlan(containerPlan);
		position.setWasteRoom(room);
		
		room.getContainers().add(position);
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
