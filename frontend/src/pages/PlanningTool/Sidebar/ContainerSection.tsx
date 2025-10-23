/**
 * ContainerSection component for adding containers in the planning tool sidebar.
 * Allows users to select service types, sizes, and specific containers to add to the room.
 */
import { motion, AnimatePresence } from "framer-motion";
import type { ContainerDTO } from "../../lib/container";
import { DRAG_DATA_FORMAT } from "../constants";

/* ─────────────── Container Props ─────────────── */
type ContainerSectionProps = {
    isAddContainersOpen: boolean;
    setIsAddContainersOpen: (v: boolean) => void;

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
};

export default function ContainerSection({
    isAddContainersOpen,
    setIsAddContainersOpen,
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
}: ContainerSectionProps) {

    /* ─────────────── Render ─────────────── */
    return (
        <div>
            {/* Toggle section */}
            <button
                className="w-full p-3 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                onClick={() => setIsAddContainersOpen(!isAddContainersOpen)}
            >
                Lägg till nya sopkärl
            </button>

            {/* Container list */}
            <AnimatePresence initial={false}>
                {isAddContainersOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 pl-4 space-y-2 relative"
                    >
                        {serviceTypes.map((type) => (
                            <motion.div key={type.id} layout className="relative">
                                {/* Service type button */}
                                <button
                                    className="w-full text-left p-2 border rounded bg-white hover:bg-blue-50 transition"
                                    onClick={async () => {
                                        if (selectedType === type.name) {
                                            setSelectedType(null);
                                            setSelectedSize({});
                                            return;
                                        }

                                        setSelectedType(type.name);
                                        setSelectedSize({});
                                        await fetchContainers(type.id);
                                    }}
                                >
                                    {type.name}
                                </button>

                                {/* Loading overlay */}
                                {isLoadingContainers && selectedType === type.name && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded z-10">
                                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-400 border-t-transparent" />
                                    </div>
                                )}

                                {/* Size buttons and container list */}
                                {selectedType === type.name && containers.length > 0 && (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-2"
                                    >
                                        {/* Size buttons */}
                                        <div className="flex flex-wrap gap-2">
                                            {Array.from(new Set(containers.map(c => c.size)))
                                                .sort((a, b) => a - b)
                                                .map((size) => (
                                                    <button
                                                        key={size}
                                                        onClick={() =>
                                                            setSelectedSize({
                                                                ...selectedSize,
                                                                [type.id]: selectedSize[type.id] === size ? null : size,
                                                            })
                                                        }
                                                        className={`flex-1 min-w-[60px] text-center p-1 border rounded bg-gray-50 hover:bg-gray-100 transition text-sm ${
                                                            selectedSize[type.id] === size ? "bg-blue-200" : ""
                                                        }`}
                                                    >
                                                        {size}L
                                                    </button>
                                                ))
                                            }
                                        </div>

                                        {/* Containers for selected size */}
                                        {selectedSize[type.id] != null && (
                                            <div className="mt-2 grid grid-cols-2 gap-4 relative">
                                                {containers
                                                    .filter(c => c.size === selectedSize[type.id])
                                                    .map((container) => (
                                                        <motion.div
                                                            key={container.id}
                                                            layout
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="border rounded p-2 bg-white flex flex-col items-center"
                                                        >
                                                            <img
                                                                src={`http://localhost:8081${container.imageFrontViewUrl}`}
                                                                alt={container.name}
                                                                className="w-24 h-24 object-contain mb-2 cursor-move"
                                                                draggable
                                                                onDragStart={(event: React.DragEvent<HTMLImageElement>) => {
                                                                    event.dataTransfer.effectAllowed = 'copy';
                                                                    event.dataTransfer.setData(DRAG_DATA_FORMAT, JSON.stringify(container));
                                                                    event.dataTransfer.setData('text/plain', container.name);
                                                                }}
                                                                onDragEnd={() => setIsStageDropActive(false)}
                                                            />
                                                            <p className="font-semibold">{container.name}</p>
                                                            <p className="text-sm">{container.width} × {container.height} × {container.depth} mm</p>
                                                            <p className="text-sm">Töms: {container.emptyingFrequencyPerYear}/år</p>
                                                            <p className="text-sm font-medium">{container.cost}:- / år</p>
                                                            <button
                                                                onClick={() => handleAddContainer(container)}
                                                                className="mt-2 px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                                                            >
                                                                Lägg till i rummet
                                                            </button>
                                                        </motion.div>
                                                    ))
                                                }
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}