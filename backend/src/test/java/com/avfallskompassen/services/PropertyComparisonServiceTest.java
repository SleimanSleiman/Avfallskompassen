package com.avfallskompassen.services;

import com.avfallskompassen.dto.CollectionFrequencyComparisonDTO;
import com.avfallskompassen.dto.ContainerSizeComparisonDTO;
import com.avfallskompassen.dto.CostComparisonDTO;
import com.avfallskompassen.dto.GeneralPropertyCostDTO;
import com.avfallskompassen.dto.PropertyComparisonDTO;
import com.avfallskompassen.dto.WasteAmountComparisonDTO;
import com.avfallskompassen.model.ContainerPlan;
import com.avfallskompassen.model.ContainerType;
import com.avfallskompassen.model.Municipality;
import com.avfallskompassen.model.MunicipalityService;
import com.avfallskompassen.model.Property;
import com.avfallskompassen.model.PropertyContainer;
import com.avfallskompassen.model.PropertyType;
import com.avfallskompassen.model.ServiceType;
import com.avfallskompassen.repository.PropertyContainerRepository;
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
	private PropertyContainerRepository propertyContainerRepository;

	@Mock
	private WasteRoomRepository wasteRoomRepository;

	@InjectMocks
	private PropertyComparisonService propertyComparisonService;

	private Property property;
	private Property similarProperty;
	private Property secondSimilarProperty;

	private List<PropertyContainer> propertyContainers;
	private PropertyContainer similarRestContainer;
	private PropertyContainer secondSimilarRestContainer;

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

		PropertyContainer propertyRest = createContainer(property, "Restavfall", 100, 10, 1);
		PropertyContainer propertyMat = createContainer(property, "Matavfall", 50, 12, 1);
		propertyContainers = List.of(propertyRest, propertyMat);

		similarRestContainer = createContainer(similarProperty, "Restavfall", 125, 8, 1);
		secondSimilarRestContainer = createContainer(secondSimilarProperty, "Restavfall", 90, 6, 1);

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

		CostComparisonDTO cost = result.getCostComparison();
		assertEquals(propertyCostDto.getTotalCost(), cost.getPropertyCost());
		assertEquals(similarCostDto.getTotalCost(), cost.getAverageCost());
		assertEquals(similarCostDto.getTotalCost(), cost.getMinCost());
		assertEquals(similarCostDto.getTotalCost(), cost.getMaxCost());
		assertEquals(1, cost.getComparisonGroupSize());
		assertEquals(-33.33, cost.getPercentageDifference(), 0.01);

	ContainerSizeComparisonDTO containerSize = result.getContainerSizeComparison();
	assertEquals(150, containerSize.getPropertyTotalVolume());
	assertEquals(125.0, containerSize.getAverageVolume(), 0.01);
		assertEquals("större", containerSize.getComparison());
		assertEquals(1, containerSize.getComparisonGroupSize());

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

		List<CollectionFrequencyComparisonDTO> frequencies = result.getFrequencyComparisons();
	assertEquals(2, frequencies.size());
	CollectionFrequencyComparisonDTO restFrequency = findFrequencyEntry(frequencies, "Restavfall");
	assertEquals(10, restFrequency.getPropertyFrequency());
	assertEquals(8.0, restFrequency.getAverageFrequency(), 0.01);
	assertEquals(25.0, restFrequency.getPercentageDifference(), 0.01);
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
		assertEquals(similarCostDto.getTotalCost(), result.getAverageCost());
		assertEquals(similarCostDto.getTotalCost(), result.getMinCost());
		assertEquals(similarCostDto.getTotalCost(), result.getMaxCost());
		assertEquals(1, result.getComparisonGroupSize());
		assertEquals(-33.33, result.getPercentageDifference(), 0.01);
	}

	@Test
	void getContainerSizeComparison_ShouldReturnContainerMetrics() {
		mockSingleSimilarScenario();

	ContainerSizeComparisonDTO result = propertyComparisonService.getContainerSizeComparison(PROPERTY_ID);

	assertEquals(150, result.getPropertyTotalVolume());
	assertEquals(125.0, result.getAverageVolume(), 0.01);
		assertEquals("större", result.getComparison());
		assertEquals(1, result.getComparisonGroupSize());
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

		when(propertyContainerRepository.findByPropertyId(PROPERTY_ID)).thenReturn(propertyContainers);
		when(propertyContainerRepository.findByPropertyIdIn(anyCollection()))
			.thenReturn(List.of(similarRestContainer, secondSimilarRestContainer));

		PropertyComparisonDTO result = propertyComparisonService.getPropertyComparison(PROPERTY_ID);

		CostComparisonDTO cost = result.getCostComparison();
		assertEquals(2, cost.getComparisonGroupSize());
		assertEquals(new BigDecimal("1650.00"), cost.getAverageCost());
		assertEquals(new BigDecimal("1500.00"), cost.getMinCost());
		assertEquals(new BigDecimal("1800.00"), cost.getMaxCost());
		assertEquals(-39.39, cost.getPercentageDifference(), 0.01);

	ContainerSizeComparisonDTO containerSize = result.getContainerSizeComparison();
	assertEquals(150, containerSize.getPropertyTotalVolume());
	assertEquals(107.5, containerSize.getAverageVolume(), 0.01);
		assertEquals("större", containerSize.getComparison());
		assertEquals(2, containerSize.getComparisonGroupSize());

		WasteAmountComparisonDTO restWaste = findWasteEntry(result.getWasteAmountComparisons(), "Restavfall");
		assertEquals(2, restWaste.getComparisonGroupSize());
		assertEquals(1000.0, restWaste.getPropertyWasteAmount(), 0.01);
		assertEquals(770.0, restWaste.getAverageWasteAmount(), 0.01);
		assertEquals(540.0, restWaste.getMinWasteAmount(), 0.01);
		assertEquals(1000.0, restWaste.getMaxWasteAmount(), 0.01);
		assertEquals(29.87, restWaste.getPercentageDifference(), 0.01);

		CollectionFrequencyComparisonDTO restFrequency = findFrequencyEntry(result.getFrequencyComparisons(), "Restavfall");
		assertEquals(2, restFrequency.getComparisonGroupSize());
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

		when(propertyContainerRepository.findByPropertyId(PROPERTY_ID)).thenReturn(propertyContainers);
		when(propertyContainerRepository.findByPropertyIdIn(anyCollection()))
			.thenReturn(new ArrayList<>(List.of(similarRestContainer)));
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

	private PropertyContainer createContainer(Property property, String serviceName, int size, int frequency, int count) {
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

		PropertyContainer container = new PropertyContainer();
		container.setProperty(property);
		container.setContainerPlan(containerPlan);
		container.setContainerCount(count);
		return container;
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
