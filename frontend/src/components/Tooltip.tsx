import React from "react";

type TooltipProps = {
  content: string;
  children: React.ReactNode;
};

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  return (
    <div className="relative group inline-block">
      {children}
      <div className="absolute left-1/2 bottom-full mb-2 hidden w-max -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs text-white shadow-sm group-hover:block">
        {content}
      </div>
    </div>
  );
};

export default Tooltip;