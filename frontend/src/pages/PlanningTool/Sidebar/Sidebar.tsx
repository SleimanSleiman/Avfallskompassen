/**
 * Sidebar component for the Planning Tool page.
 * Contains sections for room size, doors, containers, and cost estimation.
 * Handles state and actions related to these sections.
 */
import { AnimatePresence } from "framer-motion";
import ContainerSection from "./ContainerSection";
import DoorSection from "./DoorSection";
import RoomSizeSection from "./RoomSizeSection";
import CostSection from "./CostSection";
import type { ContainerDTO } from "../../../lib/container";

/* ─────────────── Sidebar Props ─────────────── */
type SidebarProps = {
    //UI state
    isAddContainersOpen: boolean;
    setIsAddContainersOpen: (v: boolean) => void;
    isAddDoorOpen: boolean;
    setIsAddDoorOpen: (v: boolean) => void;
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
    handleAddDoor: (type: any) => void;
    setRoom: any;
};

export default function Sidebar({
    isAddContainersOpen,
    setIsAddContainersOpen,
    isAddDoorOpen,
    setIsAddDoorOpen,
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
        <div className="pl-8 flex flex-col h-[600px]">

            {/* Scrollable container for all sidebar sections */}
            <div className="flex flex-col border rounded p-4 h-full overflow-y-auto space-y-3">

                {/* Section to adjust room size */}
                <RoomSizeSection
                    isAlterRoomSizeOpen={isAlterRoomSizeOpen}
                    setIsAlterRoomSizeOpen={setIsAlterRoomSizeOpen}
                    setRoom={setRoom}
                />

                {/* Section to add and manage doors */}
                <DoorSection
                    isAddDoorOpen={isAddDoorOpen}
                    setIsAddDoorOpen={setIsAddDoorOpen}
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
    );
}