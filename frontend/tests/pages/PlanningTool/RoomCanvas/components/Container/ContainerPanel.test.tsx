import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import ContainerPanel from "../../../../../../src/pages/PlanningTool/RoomCanvas/components/Container/ContainerPanel";
import { DRAG_DATA_FORMAT } from "../../../../../../src/pages/PlanningTool/lib/Constants"
import * as lucide from "lucide-react";

vi.mock("lucide-react", () => ({
    Apple: (props: any) => <div data-testid="Apple" {...props} />,
    Trash2: (props: any) => <div data-testid="Trash2" {...props} />,
    CupSoda: (props: any) => <div data-testid="CupSoda" {...props} />,
    Package: (props: any) => <div data-testid="Package" {...props} />,
    Package2: (props: any) => <div data-testid="Package2" {...props} />,
    GlassWater: (props: any) => <div data-testid="GlassWater" {...props} />,
    BottleWine: (props: any) => <div data-testid="BottleWine" {...props} />,
    InspectionPanel: (props: any) => <div data-testid="InspectionPanel" {...props} />,
    X: (props: any) => <div data-testid="X" {...props} />,
}));

afterEach(() => vi.clearAllMocks());

describe("ContainerPanel component", () => {
    const serviceTypes = [
        { id: 1, name: "Mat" },
        { id: 2, name: "Rest" },
    ];

    const availableContainers = [
        { id: 1, name: "Container 1", serviceTypeId: 1, size: 10, width: 100, height: 100, depth: 100, cost: 1000, emptyingFrequencyPerYear: 12, imageFrontViewUrl: "/c1.png" },
        { id: 2, name: "Container 2", serviceTypeId: 2, size: 20, width: 200, height: 200, depth: 200, cost: 2000, emptyingFrequencyPerYear: 6, imageFrontViewUrl: "/c2.png" },
        ];

    const selectedSize: { [key: number]: number | null } = {};

    const defaultProps = {
        isOpen: true,
        closePanel: vi.fn(),
        serviceTypes,
        selectedType: null,
        setSelectedType: vi.fn(),
        availableContainers,
        selectedSize,
        setSelectedSize: vi.fn(),
        fetchContainers: vi.fn(),
        handleAddContainer: vi.fn(),
        setSelectedContainerInfo: vi.fn(),
        isLoadingContainers: false,
        setIsStageDropActive: vi.fn(),
        setDraggedContainer: vi.fn(),
    };

    it("renders panel and service buttons", () => {
        render(<ContainerPanel {...defaultProps} />);

        expect(screen.getByText("Välj sopkärl")).toBeInTheDocument();

        serviceTypes.forEach((s) => {
        expect(screen.getByText(s.name)).toBeInTheDocument();
        });
    });

    it("calls closePanel when close button clicked", () => {
        render(<ContainerPanel {...defaultProps} />);
        const closeBtn = screen.getByLabelText("Stäng sopkärlspanelen");
        fireEvent.click(closeBtn);
        expect(defaultProps.closePanel).toHaveBeenCalled();
    });

    it("selects a service type and fetches containers", async () => {
        render(<ContainerPanel {...defaultProps} />);
        const btn = screen.getByText("Mat");
        await fireEvent.click(btn);

        expect(defaultProps.setSelectedType).toHaveBeenCalledWith("Mat");
        expect(defaultProps.setSelectedSize).toHaveBeenCalledWith({});
        expect(defaultProps.fetchContainers).toHaveBeenCalledWith(serviceTypes[0]);
    });

    it("renders filtered containers for selected service type", () => {
        render(<ContainerPanel {...defaultProps} selectedType="Mat" />);
        expect(screen.getByAltText("Container 1")).toBeInTheDocument();
        expect(screen.queryByAltText("Container 2")).not.toBeInTheDocument();
    });


    it("calls handleAddContainer when 'Lägg till' clicked", () => {
        render(<ContainerPanel {...defaultProps} selectedType="Mat" />);
        const addBtn = screen.getByText("Lägg till");
        fireEvent.click(addBtn);
        expect(defaultProps.handleAddContainer).toHaveBeenCalledWith(availableContainers[0]);
    });

    it("calls setSelectedContainerInfo when 'Info' clicked", () => {
        render(<ContainerPanel {...defaultProps} selectedType="Mat" />);
        const infoBtn = screen.getByText("Info");
        fireEvent.click(infoBtn);
        expect(defaultProps.setSelectedContainerInfo).toHaveBeenCalledWith(availableContainers[0]);
    });

    it("handles drag start and drag end", () => {
        render(<ContainerPanel {...defaultProps} selectedType="Mat" />);
        const img = screen.getByAltText("Container 1");

        const dataTransfer = {
            setData: vi.fn(),
            effectAllowed: "",
        } as unknown as DataTransfer;

        fireEvent.dragStart(img, { dataTransfer });
        expect(dataTransfer.setData).toHaveBeenCalledWith(
            DRAG_DATA_FORMAT,
            JSON.stringify(availableContainers[0])
        );
        expect(dataTransfer.setData).toHaveBeenCalledWith(
            "text/plain",
            availableContainers[0].name
        );

        expect(defaultProps.setIsStageDropActive).toHaveBeenCalledWith(true);
        expect(defaultProps.setDraggedContainer).toHaveBeenCalledWith(availableContainers[0]);

        fireEvent.dragEnd(img);
        expect(defaultProps.setIsStageDropActive).toHaveBeenCalledWith(false);
        expect(defaultProps.setDraggedContainer).toHaveBeenCalledWith(null);
    });
});
