import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type {WasteRoomImgDTO} from "../lib/WasteRoom.ts";

pdfMake.vfs = pdfFonts.vfs;

async function fetchImageAsBase64(url: string): Promise<string> {
    const res = await fetch(url, { credentials: "include" });

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

function getIndicatorStyle(indicator: any) {
    if (indicator.label === "Hög nivå") {
        return { color: "#b91c1c", dot: "●" };
    }
    if (indicator.label === "Medel nivå") {
        return { color: "#d97706", dot: "●" };
    }
    return { color: "#047857", dot: "●" };
}

function buildSummaryTable(containerSummaries: any[], collectionFee: number) {
    const rows: any[] = [
        [
            { text: "Fraktion", bold: true },
            { text: "Totala Volym (L)", bold: true, alignment: "right" },
            { text: "Totalt antal Kärl", bold: true, alignment: "right" },
            { text: "Årsvolym", bold: true, alignment: "right" },
            { text: "L/lgh/vecka", bold: true, alignment: "right" },
            { text: "Årskostnad (kr)", bold: true, alignment: "right" }
        ]
    ];

    containerSummaries.forEach(s => {
        const indicator = getIndicatorStyle(s.indicator);

        rows.push([
            {
                stack: [
                    { text: `${indicator.dot} ${s.indicator.label}`, color: indicator.color, bold: true, fontSize: 9 },
                    { text: s.type, bold: true }
                ]
            },
            { text:Number (s.totalVolume).toLocaleString(), alignment: "right" },
            { text:Number (s.totalQuantity).toLocaleString(), alignment: "right" },
            { text:Number (s.totalAnnualVolume).toLocaleString(), alignment: "right" },
            { text:Number (s.litersPerWeekPerApartment).toFixed(1), alignment: "right" },
            { text:Number (s.costPerYear).toLocaleString(), alignment: "right", bold: true }
        ]);

        s.containers.forEach((c: any) => {
            const size = Number(c.size || 0);
            const qty = Number(c.quantity || 0);
            const freq = Number(c.emptyingFrequency || 0);
            const containerCost = Number(c.cost || 0);
            const lock = Number(collectionFee || 0);

            const annualVolume = size * qty * freq;
            const unitPricePerEmptying = qty * lock * freq;
            const annualCost = unitPricePerEmptying + (qty * containerCost);

            const containerName =
                c.containerDTO?.name ||
                c.containerName ||
                `${size} L kärl`;

            rows.push([
                { text: `   └ ${c.containerName}`, italics: true, fontSize: 9 },
                { text: size.toLocaleString(), alignment: "right", fontSize: 9 },
                { text: qty.toLocaleString(), alignment: "right", fontSize: 9 },
                { text: freq.toLocaleString(), alignment: "right", fontSize: 9 },
                { text: annualVolume.toLocaleString(), alignment: "right", fontSize: 9 },
                { text: annualCost.toLocaleString(), alignment: "right", fontSize: 9 }
            ]);
        });
    });

    return {
        table: {
            widths: ["*", "auto", "auto", "auto", "auto", "auto"],
            body: rows
        },
        layout: "lightHorizontalLines",
        margin: [0, 10, 0, 10]
    };
}

export async function exportStatisticsPdf(
    propertyName: string,
    numberOfApartments: number,
    containerSummaries: any[] = [],
    data: any,
    collectionFee: number,
    selectedRoom: WasteRoomImgDTO
) {
    const logoBase64 = await fetchImageAsBase64("/src/assets/avfallskompassen_logo.png");
    const table = buildSummaryTable(containerSummaries, collectionFee);
    const totals = data?.annualCost || {};
    let wasteRoomImageBase64: string | null = null;

    console.log("thumbnailUrl =", selectedRoom.thumbnailUrl);

    if (selectedRoom.thumbnailUrl) {
        try {
            const url = `http://localhost:8081${selectedRoom.thumbnailUrl}`;
            console.log("Fetching waste room image from:", url);

            wasteRoomImageBase64 = await fetchImageAsBase64(url);
        } catch (err) {
            console.error("Failed to load waste room image:", err);
            wasteRoomImageBase64 = null;
        }
    }

    const wasteRoomImageBlock = wasteRoomImageBase64
        ? {
            image: wasteRoomImageBase64,
            fit: [280, 200],
            alignment: "center",
            margin: [0, 10, 0, 10]
        }
        : {
            text: "Ingen bild tillgänglig för detta miljörum",
            italics: true,
            color: "gray"
        };

    const doc = {
        pageMargins: [40, 80, 40, 40],

        header: {
            image: logoBase64,
            width: 100,
            margin: [40,20,0,0],
            alignment: "left"
        },

        content: [
            { text: "Rapporter & Statistik", fontSize: 20, bold: true, margin: [0,80,0,0] },
            { text: propertyName, fontSize: 12, margin: [0, 4, 0, 2] },
            { text: `Antal lägenheter: ${numberOfApartments}`, fontSize: 10, margin: [0, 0, 0, 10] },

            {
                text: "Miljörum", fontSize: 14, bold: true, margin: [0,15,0,6]
            },
            wasteRoomImageBlock,

            {
                text: "Volymer och kostnader",
                fontSize: 14,
                bold: true,
                margin: [0, 10, 0, 4]
            },

            table,

            { text: "\nTotalkostnader", bold: true, fontSize: 12 },
        ],

        footer: (current: number, total: number) => ({
            text: `Sida ${current} / ${total}`,
            alignment: "center",
            fontSize: 9,
            margin: [0, 10, 0, 0]
        })
    };

    pdfMake.createPdf(doc).download(`Statistik – ${propertyName}.pdf`);
}