import { SUMMARY_SIZE_STYLES, SUMMARY_TONE_STYLES } from "../../utils/constants"
import '../css/summaryStat.css'

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
        <div className={`summary-stat-container ${sizeStyles.container}`}>
            <div className={`summary-stat-header ${sizeStyles.headerGap}`}>
                <div className="min-w-0 space-y-1">
                    <p className={`summary-stat-title ${sizeStyles.title} ${styles.title}`}>{title}</p>
                    <p className={`summary-stat-value ${sizeStyles.value} ${styles.value}`}>{value}</p>
                </div>
                {badge && <div className="summary-stat-badge">{badge}</div>}
            </div>
            <div className={`summary-stat-description ${sizeStyles.description}`}>
                {description ?? <span className="invisible">—</span>}
            </div>
        </div>
    );
}