/**
 * Sidebar component for the Planning Tool page.
 * Contains sections for doors, containers, and cost estimation.
 * Handles state and actions related to these sections.
 */
import ContainerSection from "./ContainerSection";
import DoorSection from "./DoorSection";
import CostSection from "./CostSection";
import type { ContainerDTO } from "../../../lib/Container";
import type { Room } from "../Types";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

/* ─────────────── Sidebar Props ─────────────── */
type SidebarProps = {
    //UI state
    isAddContainersOpen: boolean;
    setIsAddContainersOpen: (v: boolean) => void;
    selectedContainerInfo: ContainerDTO | null;
    setSelectedContainerInfo: (v: ContainerDTO | null) => void;

    //Service types and container selection
    serviceTypes: { id: number; name: string }[];
    selectedType: string | null;
    setSelectedType: (v: string | null) => void;
    containers: ContainerDTO[];
    selectedSize: { [key: number]: number | null };
    setSelectedSize: React.Dispatch<React.SetStateAction<{ [key: number]: number | null }>>;
    isLoadingContainers: boolean;
    fetchContainers: (serviceId: number) => Promise<void>;
    handleAddContainer: (container: ContainerDTO, position?: { x: number; y: number }) => void;
    setIsStageDropActive: (v: boolean) => void;
    setDraggedContainer: React.Dispatch<React.SetStateAction<ContainerDTO | null>>;

    //Doors & room management
    handleAddDoor: (door: { width: number }) => boolean;
};

export default function Sidebar({
    isAddContainersOpen,
    setIsAddContainersOpen,
    selectedContainerInfo,
    setSelectedContainerInfo,
    serviceTypes,
    selectedType,
    setSelectedType,
    containers,
    selectedSize,
    setSelectedSize,
    isLoadingContainers,
    fetchContainers,
    handleAddContainer,
    setIsStageDropActive,
    handleAddDoor,
    setDraggedContainer,
}: SidebarProps ) {

    /* ─────────────── Render ─────────────── */
    return (
        <div className="pl-0 lg:pl-8 flex flex-col h-full lg:h-[750px]">
            <div className="flex flex-col gap-4 h-[750px]">

                {/* ---------- Upper box: Tools (Door + Container) ---------- */}
                <div
                    className="flex flex-col border rounded-2xl bg-white p-4 overflow-y-auto transition-all duration-300"
                    style={{
                        flex: isAddContainersOpen ? 1 : 0.60,
                        maxHeight: isAddContainersOpen ? "350px" : "230px",
                    }}
                >


                    {/* ---------- Container info view ---------- */}
                    {selectedContainerInfo ? (
                        <div>
                            {/* Back button to return to sidebar menu*/}
                            <button
                                onClick={() => setSelectedContainerInfo(null)}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span>Tillbaka</span>
                            </button>

                            {/* Container details */}
                            <div className="flex flex-col items-center text-center">
                                <img
                                    src={`http://localhost:8081${selectedContainerInfo.imageFrontViewUrl}`}
                                    alt={selectedContainerInfo.name}
                                    className="w-40 h-40 object-contain mb-3"
                                />
                                <h3 className="text-lg font-semibold mb-1">{selectedContainerInfo.name}</h3>
                                <p className="text-sm text-gray-700">
                                    {selectedContainerInfo.width} × {selectedContainerInfo.height} × {selectedContainerInfo.depth} mm
                                </p>
                                <p className="text-sm text-gray-700">Töms: {selectedContainerInfo.emptyingFrequencyPerYear} / år</p>
                                <p className="text-sm text-gray-800 font-medium mt-2">{selectedContainerInfo.cost}:- / år</p>

                                {selectedContainerInfo && [190, 240, 243, 370].includes(selectedContainerInfo.size) && (
                                    <div className="mt-4 p-3 border rounded-lg bg-gray-50 text-center">
                                        <h4 className="text-md font-semibold mb-1">Lock-i-lock</h4>
                                        <p className="text-sm text-gray-700">
                                            Detta är ett kärl som kan utrustas med lock-i-lock. <br /><br />
                                            Lock-i-lock är en typ av dubbelt lock som gör det möjligt att öppna kärlet från två håll, vilket kan vara praktiskt i trånga utrymmen
                                            eller när kärlet är placerat nära en vägg.<br /><br />
                                            Kostnad: 100kr per lock / år. <br /><br />
                                            <i>Är du intresserad av lock-i-lock? Kontakta NSR för mer information.</i>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* ---------- Main sidebar menu ---------- */}
                            <h2 className="text-lg font-black mb-3 text-nsr-teal">Verktyg</h2>
                            <div className="space-y-2 overflow-y-auto">

                                {/* Section to add a door */}
                                <DoorSection
                                    handleAddDoor={handleAddDoor}
                                />

                                {/* Section to add and manage containers */}
                                <ContainerSection
                                    isAddContainersOpen={isAddContainersOpen}
                                    setIsAddContainersOpen={setIsAddContainersOpen}
                                    serviceTypes={serviceTypes}
                                    selectedType={selectedType}
                                    setSelectedType={setSelectedType}
                                    containers={containers}
                                    selectedSize={selectedSize}
                                    setSelectedSize={setSelectedSize}
                                    isLoadingContainers={isLoadingContainers}
                                    fetchContainers={fetchContainers}
                                    handleAddContainer={handleAddContainer}
                                    setIsStageDropActive={setIsStageDropActive}
                                    setDraggedContainer={setDraggedContainer}
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* ---------- Lower box: Costs ---------- */}
                <div
                    className="flex flex-col border rounded-2xl bg-white p-4 overflow-y-auto transition-all duration-300"
                    style={{
                        flex: isAddContainersOpen ? 1.2 : 1.45,
                    }}
                >
                    <CostSection />
                </div>
            </div>
        </div>
    );
}
