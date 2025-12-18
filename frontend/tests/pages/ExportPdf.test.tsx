import { it, expect, beforeEach, vi } from "vitest"
import pdfMake from "pdfmake/build/pdfmake"
import {exportStatisticsPdf} from "../../src/pages/ExportPdf";

vi.mock("pdfmake/build/pdfmake", () => ({
    default: {
        createPdf: vi.fn(() => ({
            download: vi.fn()
        }))
    }
}))

const fetchMock = vi.fn()
global.fetch = fetchMock as any

class MockFileReader {
    result: string | null = null
    onloadend: (() => void) | null = null
    onerror: (() => void) | null = null

    readAsDataURL() {
        this.result = "data:image/png;base64,TEST"
        this.onloadend?.()
    }
}
global.FileReader = MockFileReader as any

function mockFetchSuccess() {
    fetchMock.mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(new Blob(["test"]))
    })
}

function mockFetchFail() {
    fetchMock.mockRejectedValue(new Error("Fetch failed"))
}

beforeEach(() => {
    vi.resetAllMocks()
})

it("downloads PDF when everything succeeds", async () => {
    mockFetchSuccess()

    await exportStatisticsPdf(
        "Property",
        10,
        50,
        "Lock",
        [],
        {},
        200,
        { thumbnailUrl: "/room.png" }
    )

    expect(pdfMake.createPdf).toHaveBeenCalled()
})

it("still creates PDF if footer image fails", async () => {
    fetchMock
        .mockResolvedValueOnce({
            ok: true,
            blob: () => Promise.resolve(new Blob(["logo"]))
        })
        .mockRejectedValueOnce(new Error("Footer fail"))

    await exportStatisticsPdf(
        "Test",
        1,
        10,
        "Lock",
        [],
        {},
        123,
        { thumbnailUrl: null as string }
    )

    expect(pdfMake.createPdf).toHaveBeenCalled()
})

it("still creates PDF if waste room image fails", async () => {
    fetchMock
        .mockResolvedValueOnce({
            ok: true,
            blob: () => Promise.resolve(new Blob(["logo"]))
        })
        .mockResolvedValueOnce({
            ok: true,
            blob: () => Promise.resolve(new Blob(["footer"]))
        })
        .mockRejectedValueOnce(new Error("Room image fail"))

    await exportStatisticsPdf(
        "Test",
        1,
        10,
        "Lock",
        [],
        {},
        123,
        { thumbnailUrl: "/bad-image.png" }
    )

    expect(pdfMake.createPdf).toHaveBeenCalled()
})

it("throws if logo fails to load", async () => {
    mockFetchFail()

    await expect(() =>
        exportStatisticsPdf(
            "Fail",
            1,
            1,
            "Lock",
            [],
            {},
            10,
            { thumbnailUrl: null as string }
        )
    ).rejects.toThrow()
})

it("builds PDF with headers, footer, and content", async () => {
    mockFetchSuccess()

    await exportStatisticsPdf(
        "Inspect",
        1,
        1,
        "Lock",
        [],
        {},
        10,
        { thumbnailUrl: null as string }
    )

    const doc = (pdfMake.createPdf as any).mock.calls[0][0]

    expect(doc.pageSize).toBe("A4")
    expect(doc.header).toBeInstanceOf(Function)
    expect(doc.footer).toBeInstanceOf(Function)
    expect(doc.content.length).toBeGreaterThan(0)
})

it("uses correct filename when downloading", async () => {
    mockFetchSuccess()

    await exportStatisticsPdf(
        "FilenameTest",
        1,
        1,
        "Lock",
        [],
        {},
        10,
        { thumbnailUrl: null as string }
    )

    const instance = (pdfMake.createPdf as any).mock.results[0].value
    expect(instance.download).toHaveBeenCalledWith("NSR Rapport - FilenameTest.pdf")
})

