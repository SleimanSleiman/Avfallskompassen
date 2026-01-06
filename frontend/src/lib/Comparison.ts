import { api } from './Api';

export interface CostComparison {
  propertyCost: number;
  averageCost: number;
  minCost: number;
  maxCost: number;
  percentageDifference: number;
  comparisonGroupSize: number;
}

export interface ContainerSizeComparison {
  propertyTotalVolume: number;
  averageVolume: number;
  comparison: string;
  comparisonGroupSize: number;
  averageCollectionFrequency: number;
}

export interface WasteAmountComparison {
  propertyWasteAmount: number;
  averageWasteAmount: number;
  minWasteAmount: number;
  maxWasteAmount: number;
  percentageDifference: number;
  comparisonGroupSize: number;
  wasteType: string;
}

export interface CollectionFrequencyComparison {
  propertyFrequency: number;
  averageFrequency: number;
  percentageDifference: number;
  comparisonGroupSize: number;
  wasteType: string;
}

export interface PropertyComparison {
  propertyId: number;
  address: string;
  numberOfApartments: number;
  propertyType: string;
  costComparison: CostComparison;
  containerSizeComparison: ContainerSizeComparison;
  wasteAmountComparisons: WasteAmountComparison[];
  frequencyComparisons: CollectionFrequencyComparison[];
}

export const fetchPropertyComparison = async (propertyId: number) => {
  return api<PropertyComparison>(`/api/properties/${propertyId}/comparison`);
};
