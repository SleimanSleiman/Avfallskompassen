import { useEffect, useState } from "react";

export default function Message({ message, type = "success", duration = 5000 }: any) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    if (!message) return;
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [message, duration]);

  if (!message || !visible) return null;

  const styles = {
    success: "rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 mb-4",
    error: "rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 mb-4",
  };

  return <div className={type === "success" ? styles.success : styles.error}>{message}</div>;
}
