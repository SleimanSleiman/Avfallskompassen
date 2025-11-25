import { SUMMARY_SIZE_STYLES, SUMMARY_TONE_STYLES } from "../../utils/constants"

export default function SummaryStat({
    title,
    value,
    description,
    tone = "neutral",
    badge,
    size = "default",
}: {
    title: string;
    value: string;
    description?: ReactNode;
    tone?: SummaryTone;
    badge?: ReactNode;
    size?: SummarySize;
}) {
    const styles = SUMMARY_TONE_STYLES[tone];
    const sizeStyles = SUMMARY_SIZE_STYLES[size];

    return (
        <div className={`flex h-full flex-col rounded-lg border border-gray-200/70 bg-white/80 shadow-sm ${sizeStyles.container}`}>
            <div className={`flex w-full flex-wrap items-start justify-between ${sizeStyles.headerGap}`}>
                <div className="min-w-0 space-y-1">
                    <p className={`${sizeStyles.title} font-semibold uppercase tracking-tight ${styles.title}`}>{title}</p>
                    <p className={`${sizeStyles.value} font-semibold leading-tight ${styles.value}`}>{value}</p>
                </div>
                {badge ? <div className="max-w-full flex-shrink-0">{badge}</div> : null}
            </div>
            <div className={`flex-1 text-gray-600 space-y-1 ${sizeStyles.description}`}>
                {description ?? <span className="invisible">—</span>}
            </div>
        </div>
    );
}