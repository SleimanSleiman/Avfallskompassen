export default function BenchmarkBar({ value, benchmark, className = "mt-2" }: { value: number | null; benchmark: number; className?: string }) {
    const containerClass = `h-2 w-full overflow-hidden rounded-full bg-gray-100 ${className}`;

    if (value == null) {
        return <div className={containerClass} />;
    }

    const clamped = Math.max(0, value);
    const ratio = Math.min(clamped / benchmark, 1);
    const overflow = clamped > benchmark;

    return (
        <div className={containerClass}>
            <div
                className={`h-2 rounded-full transition-all duration-500 ${overflow ? "bg-gradient-to-r from-amber-400 to-amber-600" : "bg-gradient-to-r from-emerald-400 to-emerald-600"}`}
                style={{ width: `${Math.round(ratio * 100)}%` }}
            />
        </div>
    );
}