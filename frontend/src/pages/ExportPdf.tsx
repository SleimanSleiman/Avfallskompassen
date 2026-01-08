import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { WasteRoomImgDTO } from "../lib/WasteRoom.ts";
import type {Content, PageSize, TDocumentDefinitions} from "pdfmake/interfaces";

pdfMake.vfs = pdfFonts.vfs;

type SummaryRow = {
    type: string;
    indicator: { label: string};
    totalVolume: number;
    totalQuantity: number;
    totalAnnualVolume: number;
    litersPerWeekPerApartment: number;
    costPerYear: number;
    container?: ContainersRow[];
};

type ContainersRow = {
    size?: number;
    quantity?: number;
    emptyingFrequency?: number;
    cost?: number;
    containerDTO?: {name: string };
    containerName?: string;
};

const COLORS = {
    primary: '#007788',
    secondary: '#007788',
    accent: '#e8c222',

    status: {
        high: '#b91c1c',
        medium: '#d97706',
        low: '#047857',
    },

    text: {
        primary: '#1f2937',
        secondary: '#6b7280',
        muted: '#9ca3af',
        white: '#ffffff',
    },

    background: {
        white: '#ffffff',
        light: '#f9fafb',
        blue: '#eff6ff',
    },

    border: {
        light: '#e5e7eb',
    }
} as const;

const FONT_SIZES = {
    title: 22,
    subtitle: 16,
    large: 24,
    medium: 14,
    normal: 10,
    small: 9,
    header: 12,
} as const;

const LOCALE = 'sv-SE';

const MARGINS = {
    page: [40, 100, 40, 80] as [number, number, number, number],
    section: [0, 15, 0, 20] as [number, number, number, number],
    standard: [0, 0, 0, 15] as [number, number, number, number],
} as const;

const TABLE_COLUMN_WIDTHS = [85, 50, 30, 55, 55, 40, 45, 55, 55] as const;

async function fetchImageAsBase64(url: string): Promise<string> {
    const res = await fetch(url);

    if (!res.ok) {
        throw new Error("Failed to fetch room image");
    }

    const blob = await res.blob();

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function formatNumber(num: number, decimals = 0): string {
    return decimals > 0
        ? num.toFixed(decimals)
        : num.toLocaleString(LOCALE);
}

function formatDate(date: Date): string {
    return date.toLocaleDateString(LOCALE, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getRowColor(index: number): string {
    return index % 2 === 0 ? COLORS.background.light : COLORS.background.white;
}

function getIndicatorColor(label: string): string {
    switch (label) {
        case "Hög nivå":
            return COLORS.status.high;
        case "Medel nivå":
            return COLORS.status.medium;
        default:
            return COLORS.status.low;
    }
}

function createTableHeaderCell(text: string, alignment: 'left' | 'right' | 'center' = 'left') {
    return {
        text,
        bold: true,
        fillColor: COLORS.primary,
        color: COLORS.text.white,
        fontSize: FONT_SIZES.normal,
        alignment,
        noWrap: false,
    };
}

function createTableCell(
    text: string | number,
    alignment: 'left' | 'right' | 'center' = 'left',
    fillColor: string,
    options: Partial<Content> = {}
) {
    return {
        text: String(text),
        alignment,
        fillColor,
        fontSize: FONT_SIZES.small,
        color: COLORS.text.secondary,
        noWrap: false,
        options
    };
}

function createDivider(margin: [number, number, number, number] = [0, 30, 0, 20]) {
    return {
        canvas: [{
            type: 'line',
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 3,
            lineColor: COLORS.secondary
        }],
        margin
    };
}

function createStatCard(label: string, value: string, fontSize = FONT_SIZES.large) {
    return {
        width: '*',
        stack: [
            {
                canvas: [{
                    type: 'rect',
                    x: 0,
                    y: 0,
                    w: 160,
                    h: 60,
                    r: 4,
                    color: COLORS.background.blue,
                    lineColor: COLORS.primary,
                    lineWidth: 1
                }]
            },
            {
                text: label,
                fontSize: FONT_SIZES.small,
                color: COLORS.text.secondary,
                bold: true,
                margin: [10, -50, 0, 4]
            },
            {
                text: value,
                fontSize,
                color: COLORS.primary,
                bold: true,
                margin: [10, 0, 0, 0]
            }
        ]
    };
}

function createSectionHeader(text: string, fontSize = FONT_SIZES.title) {
    return {
        text,
        fontSize,
        bold: true,
        color: COLORS.accent,
        margin: [0, 0, 0, fontSize === FONT_SIZES.title ? 20 : 10]
    };
}

function createFieldLabel(label: string) {
    return {
        text: label,
        fontSize: FONT_SIZES.normal,
        color: COLORS.text.secondary,
        bold: true,
        margin: [0, 0, 0, 4]
    };
}

function createFieldValue(value: string, fontSize = FONT_SIZES.medium) {
    return {
        text: value,
        fontSize,
        color: COLORS.text.primary,
        margin: [0, 0, 0, 15]
    };
}

function createTableHeaderRow() {
    return [
        createTableHeaderCell("Fraktion"),
        createTableHeaderCell("Volym (L)", "right"),
        createTableHeaderCell("Antal", "right"),
        createTableHeaderCell("Hämtfrekv.", "right"),
        createTableHeaderCell("Årsvolym", "right"),
        createTableHeaderCell("%", "right"),
        createTableHeaderCell("L/lgh/v", "right"),
        createTableHeaderCell("Kostnad", "right"),
        createTableHeaderCell("Fördelning", "right")
    ];
}

function createSummaryRow(summary: SummaryRow, index: number, totalAnnualVolume: number, totalCost: number) {
    const rowColor = getRowColor(index);
    const indicatorColor = getIndicatorColor(summary.indicator.label);
    const volumePercent = totalAnnualVolume > 0
        ? (Number(summary.totalAnnualVolume) / totalAnnualVolume * 100)
        : 0;
    const costPercent = totalCost > 0
        ? (Number(summary.costPerYear) / totalCost * 100)
        : 0;

    return [
        {
            text: summary.type,
            color: indicatorColor,
            bold: true,
            fillColor: rowColor,
            fontSize: FONT_SIZES.normal,
            noWrap: false
        },
        createTableCell(formatNumber(Number(summary.totalVolume)), "right", rowColor, { bold: true }),
        createTableCell(formatNumber(Number(summary.totalQuantity)), "right", rowColor, { bold: true }),
        createTableCell("—", "center", rowColor, { color: COLORS.text.muted }),
        createTableCell(formatNumber(Number(summary.totalAnnualVolume)), "right", rowColor, { bold: true }),
        createTableCell(`${formatNumber(volumePercent, 1)}%`, "right", rowColor, { bold: true }),
        createTableCell(formatNumber(Number(summary.litersPerWeekPerApartment), 1), "right", rowColor, { bold: true }),
        createTableCell(formatNumber(Number(summary.costPerYear)), "right", rowColor, { bold: true }),
        createTableCell(`${formatNumber(costPercent, 1)}%`, "right", rowColor, { bold: true })
    ];
}

function createContainerRow(container: ContainersRow, rowColor: string, collectionFee: number) {
    const size = Number(container.size || 0);
    const qty = Number(container.quantity || 0);
    const freq = Number(container.emptyingFrequency || 0);
    const containerCost = Number(container.cost || 0);

    const annualVolume = size * qty * freq;
    const unitPricePerEmptying = qty * collectionFee * freq;
    const annualCost = unitPricePerEmptying + (qty * containerCost);
    const containerName = container.containerDTO?.name || container.containerName || `${size} L kärl`;

    return [
        {
            text: `   ${containerName}`,
            italics: true,
            fontSize: FONT_SIZES.small,
            margin: [8, 0, 0, 0],
            fillColor: rowColor,
            color: COLORS.text.secondary,
            noWrap: false
        },
        createTableCell(formatNumber(size), "right", rowColor),
        createTableCell(formatNumber(qty), "right", rowColor),
        createTableCell(formatNumber(freq), "right", rowColor),
        createTableCell(formatNumber(annualVolume), "right", rowColor),
        createTableCell("", "right", rowColor),
        createTableCell("", "right", rowColor),
        createTableCell(formatNumber(annualCost), "right", rowColor),
        createTableCell("", "right", rowColor)
    ];
}

function createTotalRow(totalAnnualVolume: number, totalCost: number) {
    return [
        createTableHeaderCell("TOTALT"),
        { text: "", fillColor: COLORS.primary },
        { text: "", fillColor: COLORS.primary },
        { text: "", fillColor: COLORS.primary },
        createTableHeaderCell(formatNumber(totalAnnualVolume), "right"),
        createTableHeaderCell("100%", "right"),
        { text: "", fillColor: COLORS.primary },
        createTableHeaderCell(formatNumber(totalCost), "right"),
        createTableHeaderCell("100%", "right")
    ];
}

function buildSummaryTable(containerSummaries: any[], collectionFee: number) {
    const rows: any[] = [createTableHeaderRow()];

    const totalAnnualVolume = containerSummaries.reduce(
        (sum, s) => sum + Number(s.totalAnnualVolume || 0),
        0
    );
    const totalCost = containerSummaries.reduce(
        (sum, s) => sum + Number(s.costPerYear || 0),
        0
    );

    containerSummaries.forEach((summary, index) => {
        const rowColor = getRowColor(index);

        rows.push(createSummaryRow(summary, index, totalAnnualVolume, totalCost));

        if (summary.containers?.length > 0) {
            summary.containers.forEach((container: any) => {
                rows.push(createContainerRow(container, rowColor, collectionFee));
            });
        }
    });

    rows.push(createTotalRow(totalAnnualVolume, totalCost));

    return {
        table: {
            widths: TABLE_COLUMN_WIDTHS,
            body: rows,
            headerRows: 1
        },
        layout: {
            hLineWidth: (i: number, node: any) => {
                if (i === 0 || i === 1) return 1.5;
                if (i === node.table.body.length) return 1.5;
                return 0.5;
            },
            vLineWidth: () => 0,
            hLineColor: (i: number) =>
                (i === 0 || i === 1) ? COLORS.primary : COLORS.border.light,
            paddingLeft: () => 7,
            paddingRight: () => 5,
            paddingTop: () => 6,
            paddingBottom: () => 6
        },
        margin: [-30, 15, 0, 20]
    };
}


function createHeader(
    logoBase64: string,
    propertyName: string,
    currentPage: number
): Content {
    if (currentPage === 1) {
        const headerColumns: Content[] = [
            {
                image: logoBase64,
                width: 120,
                margin: [0, 0, 0, 0] as [number, number, number, number],
            },
            {
                stack: [
                    {
                        text: "NSR - Rapport",
                        fontSize: FONT_SIZES.large,
                        bold: true,
                        color: COLORS.accent,
                        alignment: "right",
                    },
                    {
                        text: formatDate(new Date()),
                        fontSize: FONT_SIZES.normal,
                        color: COLORS.text.secondary,
                        alignment: "right",
                        margin: [0, 4, 0, 0] as [number, number, number, number],
                    },
                ],
                margin: [0, 15, 0, 0] as [number, number, number, number],
            },
        ];

        return {
            columns: headerColumns,
        };
    }

    const headerColumns: Content[] = [
        {
            image: logoBase64,
            width: 60,
        },
        {
            text: propertyName,
            fontSize: FONT_SIZES.header,
            color: COLORS.accent,
            bold: true,
            alignment: "right",
            margin: [0, 8, 0, 0] as [number, number, number, number],
        },
    ];

    return {
        columns: headerColumns,
    };
}

function createFooter(footerBase64: string | null, currentPage: number, pageCount: number) {
    const footerContent: any[] = [];

    if (footerBase64) {
        footerContent.push({
            image: footerBase64,
            width: 515,
            alignment: "center",
            margin: [0, 0, 0, 10] as [number, number, number, number],
        });
    }

    footerContent.push({
        text: `Sida ${currentPage} av ${pageCount}`,
        alignment: "center",
        fontSize: FONT_SIZES.small,
        color: COLORS.text.secondary,
        margin: [0,0,0,0] as [number, number, number, number],
    });

    return {
        stack: footerContent,
    };
}

function createWasteRoomSection(propertyName: string, wasteRoomImageBase64: string | null) {
    const wasteRoomImageBlock = wasteRoomImageBase64
        ? {
            image: wasteRoomImageBase64,
            fit: [500, 350],
            alignment: "center",
            margin: MARGINS.section,
            pageBreak: "avoid"
        }
        : {
            text: "Ingen bild tillgänglig för detta miljörum",
            italics: true,
            color: COLORS.text.muted,
            alignment: "center",
            margin: [0, 40, 0, 40]
        };

    return [
        createDivider([0, 80, 0, 20]),
        createSectionHeader("MILJÖRUM"),
        {
            columns: [
                {
                    width: '*',
                    stack: [
                        createFieldLabel("Fastighet"),
                        createFieldValue(propertyName)
                    ]
                }
            ],
            margin: MARGINS.standard
        },
        wasteRoomImageBlock
    ];
}

function createStatisticsSection(
    numberOfApartments: number,
    accessPathLength: number,
    collectionFee: number,
    lockName: string,
    table: any
) {
    return [
        createDivider([0, 30, 0, 20]),
        createSectionHeader("RAPPORTER & STATISTIK"),
        {
            columns: [
                createStatCard("Antal lägenheter", numberOfApartments.toString()),
                createStatCard(
                    "Dragväg & Kostnad/Kärl",
                    `${accessPathLength}m - ${collectionFee} kr`,
                    FONT_SIZES.large
                ),
                createStatCard("Lås", lockName, FONT_SIZES.large)
            ],
            columnGap: 10,
            margin: [0, 0, 0, 30]
        },
        createSectionHeader("Volymer och kostnader", FONT_SIZES.title),
        table
    ];
}

export async function exportStatisticsPdf(
    propertyName: string,
    numberOfApartments: number,
    accessPathLength: number,
    lockName: string,
    containerSummaries: any[] = [],
    collectionFee: number,
    selectedRoom: WasteRoomImgDTO
) {
    const logoBase64 = await fetchImageAsBase64("/src/assets/avfallskompassen_logo.png");

    let footerBase64: string | null = null;
    try {
        footerBase64 = await fetchImageAsBase64("/src/assets/footer-top.png");
    } catch (err) {
        console.error("Failed to load footer image:", err);
    }

    let wasteRoomImageBase64: string | null = null;
    if (selectedRoom.thumbnailUrl) {
        try {
            const url = selectedRoom.thumbnailUrl.startsWith("http")
                ? selectedRoom.thumbnailUrl
                : `http://localhost:8081${selectedRoom.thumbnailUrl}`;
            wasteRoomImageBase64 = await fetchImageAsBase64(url);
        } catch (err) {
            console.error("Failed to load waste room image:", err);
        }
    }

    const table = buildSummaryTable(containerSummaries, collectionFee);

    const doc: TDocumentDefinitions = {
        pageMargins: MARGINS.page,
        pageSize: "A4" as PageSize,
        header: (currentPage: number) => createHeader(logoBase64, propertyName, currentPage),
        content: [
            ...createWasteRoomSection(propertyName, wasteRoomImageBase64),
            { canvas: [], pageBreak: "before" },
            ...createStatisticsSection(
                numberOfApartments,
                accessPathLength,
                collectionFee,
                lockName,
                table
            )
        ],
        footer: (currentPage: number, pageCount: number) => createFooter(footerBase64, currentPage, pageCount),
        defaultStyle: {
            font: 'Roboto'
        }
    };

    pdfMake.createPdf(doc).download(`NSR Rapport - ${propertyName}.pdf`);
}