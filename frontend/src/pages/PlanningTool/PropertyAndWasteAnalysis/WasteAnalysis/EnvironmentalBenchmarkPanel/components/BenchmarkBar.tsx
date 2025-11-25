import '../../css/benchmarkPanel.css'

export default function BenchmarkBar({ value, benchmark, className = "mt-2" }: { value: number | null; benchmark: number; className?: string }) {
    const containerClass = `benchmark-bar-container ${className}`;

    if (value == null) {
        return <div className={containerClass} />;
    }

    const clamped = Math.max(0, value);
    const ratio = Math.min(clamped / benchmark, 1);
    const overflow = clamped > benchmark;

    return (
        <div className="benchmark-bar-container">
            <div
                className={overflow ? "benchmark-bar-overflow" : "benchmark-bar-normal"}
                style={{ width: `${Math.round(ratio * 100)}%` }}
            />
        </div>
    );
}