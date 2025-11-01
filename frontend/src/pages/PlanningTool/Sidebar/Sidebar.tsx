/**
 * Sidebar component for the Planning Tool page.
 * Contains sections for room size, doors, containers, and cost estimation.
 * Handles state and actions related to these sections.
 */
import ContainerSection from "./ContainerSection";
import DoorSection from "./DoorSection";
import RoomSizeSection from "./RoomSizeSection";
import CostSection from "./CostSection";
import type { ContainerDTO } from "../../../lib/Container";
import type { Room } from "../Types";

/* ─────────────── Sidebar Props ─────────────── */
type SidebarProps = {
    //UI state
    isAddContainersOpen: boolean;
    setIsAddContainersOpen: (v: boolean) => void;
    isAlterRoomSizeOpen: boolean;
    setIsAlterRoomSizeOpen: (v: boolean) => void;
    showCosts: boolean;
    setShowCosts: (v: boolean) => void;

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

    //Doors & room management
    handleAddDoor: (door: { width: number }) => boolean;
    setRoom: (room: Room) => void;
};

export default function Sidebar({
    isAddContainersOpen,
    setIsAddContainersOpen,
    isAlterRoomSizeOpen,
    setIsAlterRoomSizeOpen,
    showCosts,
    setShowCosts,
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
    setRoom,
}: SidebarProps ) {

    /* ─────────────── Render ─────────────── */
    return (
        <div className="pl-0 lg:pl-8 flex flex-col h-auto lg:h-[600px]">

            {/* Scrollable container for all sidebar sections */}
            <div className="flex flex-col border rounded-2xl bg-white p-4 h-full overflow-y-auto">
                <h2 className="text-lg font-black mb-4">Verktyg</h2>
                <div className="space-y-2">

                {/* Section to adjust room size */}
                <RoomSizeSection
                    isAlterRoomSizeOpen={isAlterRoomSizeOpen}
                    setIsAlterRoomSizeOpen={setIsAlterRoomSizeOpen}
                    setRoom={setRoom}
                />

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
                />

                {/* Section to show costs */}
                <CostSection
                    showCosts={showCosts}
                    setShowCosts={setShowCosts}
                />
                </div>
            </div>
        </div>
    );
}