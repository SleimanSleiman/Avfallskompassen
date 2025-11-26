/**
 * ContainerPanel Component
 * A slide-in panel that lets the user browse and filter available containers,
 * select sizes, drag containers onto the canvas, or add them directly.
 */

import { useCallback, useEffect, forwardRef, type ForwardRef, Dispatch, type SetStateAction } from "react";
import { Apple, Trash2, CupSoda, Package, Package2, GlassWater, BottleWine, InspectionPanel, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ContainerDTO } from "../../../../../lib/Container";
import { DRAG_DATA_FORMAT } from "../../../Constants";
import LoadingBar from "../../../../../components/LoadingBar";
import './css/roomCanvasPanel.css'

type ContainerPanelProps = {
    isOpen: boolean;
    closePanel: () => void;
    serviceTypes: { id: number; name: string }[];
    selectedType: string | null;
    setSelectedType: (value: string | null) => void;
    availableContainers: ContainerDTO[];
    selectedSize: { [key: number]: number | null };
    setSelectedSize: React.Dispatch<React.SetStateAction<{ [key: number]: number | null }>>;
    fetchContainers: (service: { id: number; name: string }) => Promise<void>;
    handleAddContainer: (container: ContainerDTO) => void;
    setSelectedContainerInfo: (container: ContainerDTO) => void;
    isLoadingContainers: boolean;
    setIsStageDropActive: (v: boolean) => void;
    setDraggedContainer: Dispatch<SetStateAction<ContainerDTO | null>>;
};

//Maps service type names to icons based on keyword matching
type ServiceTypeIconRule = {
    keywords: string[];
    Icon: LucideIcon;
};

const SERVICE_TYPE_ICON_RULES: ServiceTypeIconRule[] = [
    { keywords: ["mat"], Icon: Apple },
    { keywords: ["rest"], Icon: Trash2 },
    { keywords: ["plast"], Icon: CupSoda },
    { keywords: ["papper", "tidning"], Icon: Package },
    { keywords: ["ofärgat"], Icon: GlassWater },
    { keywords: ["färgat"], Icon: BottleWine },
    { keywords: ["glas"], Icon: GlassWater },
    { keywords: ["metall"], Icon: InspectionPanel }
];

const getServiceTypeIcon = (name: string): LucideIcon => {
    //Find matching icon rule
    const normalized = name.toLowerCase();
    const match = SERVICE_TYPE_ICON_RULES.find(rule =>
        rule.keywords.some(keyword => normalized.includes(keyword))
    );
    return match?.Icon ?? Package2;
};

//ForwardRef is used so the parent can animate or scroll this panel directly.
const ContainerPanel = forwardRef(function ContainerPanel(
    props: ContainerPanelProps,
    ref: ForwardedRef<HTMLDivElement>
) {
    const {
        isOpen,
        closePanel,
        serviceTypes,
        selectedType,
        setSelectedType,
        availableContainers,
        selectedSize,
        setSelectedSize,
        fetchContainers,
        handleAddContainer,
        setSelectedContainerInfo,
        isLoadingContainers,
        setIsStageDropActive,
        setDraggedContainer,
    } = props;

    //Select or toggle a service type.Selecting it again clears the current selection.
    const handleSelectServiceType = async (type: { id: number; name: string }) => {
        if (selectedType === type.name) {
            setSelectedType(null);
            setSelectedSize({});
            return;
        }
        setSelectedType(type.name);
        setSelectedSize({});
        await fetchContainers(type);
    };

    //Close on Escape
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") closePanel();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, closePanel]);

    //Get currently active service type
    const activeType = selectedType
        ? serviceTypes.find((type) => type.name === selectedType) ?? null
        : null;

    //Filter containers for selected type
    const containersForActiveType = activeType
        ? availableContainers.filter((c) => c.serviceTypeId === activeType.id)
        : [];

    //Collect unique size options
    const sizeOptions = activeType
        ? Array.from(new Set(containersForActiveType.map(c => c.size))).sort((a, b) => a - b)
        : [];

    //Get selected size
    const activeSize = activeType ? selectedSize[activeType.id] ?? null : null;

    //Filter containers by selected size
    const filteredContainers = activeType
        ? (activeSize != null
            ? containersForActiveType
                .filter(c => c.size === activeSize)
                .sort((a, b) => a.size - b.size || a.cost - b.cost)
            : containersForActiveType
                .slice()
                .sort((a, b) => a.size - b.size || a.cost - b.cost))
        : [];

    //Toggle a size filter
    const handleToggleSize = (typeId: number, size: number) => {
        setSelectedSize(prev => ({
            ...prev,
            [typeId]: prev[typeId] === size ? null : size,
        }));
    };

    /* ──────────────── Render ──────────────── */
    return (
        <div ref={ref} className={`transition-panel ${isOpen ? "panel-open" : "panel-closed"}`}>
            <div className="panel-card">
                <div className="panel-header">
                    <div>
                        <h3 className="panel-h3">Välj sopkärl</h3>
                        <p className="panel-p">
                            Öppna en tjänst nedan, filtrera på volym och dra kärlet till ritningen eller använd Lägg till.
                        </p>
                    </div>

                    {/*Close panel*/}
                    <button onClick={closePanel} className="panel-close-btn" aria-label="Stäng sopkärlspanelen">
                        <X className="panel-close-btn-icon" />
                    </button>
                </div>

                <div className="panel-inner">
                    {/*No services loaded*/}
                    {serviceTypes.length === 0 ? (
                        <p className="empty-text">Inga avfallstjänster kunde hämtas just nu.</p>
                    ) : (
                        <div className="services-wrapper">
                            <div className="services-grid">
                                {serviceTypes.map(type => {
                                    const isSelected = selectedType === type.name;
                                    const IconComponent = getServiceTypeIcon(type.name);

                                    return (
                                        <button
                                            key={type.id}
                                            title={type.name}
                                            onClick={() => handleSelectServiceType(type)}
                                            className={"service-btn"}
                                        >
                                            {/*Service icon*/}
                                            <span className={`service-icon ${isSelected ? "service-icon-selected" : ""}`}>
                                                <IconComponent className="service-icon-size" aria-hidden="true"/>
                                            </span>
                                            {/*Service label*/}
                                            <span className={`service-label ${isSelected ? "service-label-selected" : ""}`}>
                                                {type.name}
                                            </span>
                                        </button>
                                );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="container-scroll">
                        {/*No type selected*/}
                        {!activeType ? (
                            <p className="empty-text">Välj en avfallstjänst för att visa tillgängliga sopkärl.</p>
                        ) : isLoadingContainers ? (
                            <div className="loading-wrapper">
                                <LoadingBar message="Laddar kärl..." />
                            </div>
                        ) : containersForActiveType.length === 0 ? (
                            <p className="empty-text">Inga kärl hittades för {activeType.name}.</p>
                        ) : (
                            <div className="size-filter-wrapper">
                                {/*Size filter buttons*/}
                                {sizeOptions.length > 0 && (
                                    <div className="size-filter">
                                        {sizeOptions.map((size) => (
                                            <button
                                                key={`${activeType.id}-${size}`}
                                                onClick={() => handleToggleSize(activeType.id, size)}
                                                className={`size-btn ${activeSize === size ? "size-btn-active" : ""}`}
                                            >
                                                {size} L
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/*Container list*/}
                        <div className="container-list-scroll">
                            <div className="container-grid">
                                {filteredContainers.map(container => (
                                    <div key={container.id} className="container-card">
                                        <div className="container-top">
                                            {/*Drag image*/}
                                            <img
                                                src={`http://localhost:8081${container.imageFrontViewUrl}`}
                                                alt={container.name}
                                                className="container-img"
                                                draggable
                                                onDragStart={(event) => {
                                                    event.dataTransfer.effectAllowed = "copy";
                                                    event.dataTransfer.setData(DRAG_DATA_FORMAT, JSON.stringify(container));
                                                    event.dataTransfer.setData("text/plain", container.name);
                                                    setIsStageDropActive(true);
                                                    setDraggedContainer(container);
                                                }}

                                                onDragEnd={() => {
                                                    setIsStageDropActive(false);
                                                    setDraggedContainer(null);
                                                }}
                                            />
                                            {/*Container info*/}
                                            <div className="container-info">
                                                <p className="container-title">{container.name}</p>
                                                <p>{container.width} × {container.height} × {container.depth} mm</p>
                                                <p>Tömningsfrekvens: {container.emptyingFrequencyPerYear}/år</p>
                                                <p>Kostnad: {container.cost} kr/år</p>
                                            </div>
                                        </div>

                                        {/*Action buttons*/}
                                        <div className="container-actions">
                                            <button
                                                onClick={() => handleAddContainer(container)}
                                                className="container-btn container-btn-add"
                                            >
                                                Lägg till
                                            </button>
                                            <button
                                                onClick={() => setSelectedContainerInfo(container)}
                                                className="container-btn container-btn-info"
                                            >
                                                Info
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ContainerPanel;
