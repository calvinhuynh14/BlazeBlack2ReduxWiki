import React from "react";

interface BSTDisplayProps {
  currentBST: number;
  vanillaBST?: number;
}

export default function BSTDisplay({
  currentBST,
  vanillaBST,
}: BSTDisplayProps) {
  // Calculate BST change if vanilla BST is provided
  const bstChange = vanillaBST ? currentBST - vanillaBST : 0;
  const hasChange = bstChange !== 0;

  // Determine BST text color based on change
  const getBSTColor = () => {
    if (!hasChange) return "text-[var(--text-color-light)]";
    return bstChange > 0 ? "text-green-500" : "text-red-500";
  };

  return (
    <div className="flex items-center gap-3">
      <div className="min-w-[80px] text-sm">
        <span className={getBSTColor()}>
          BST
          {hasChange && (
            <sup className="ml-1 text-xs">
              {bstChange > 0 ? "+" : ""}
              {bstChange}
            </sup>
          )}
        </span>
      </div>
      <span className="text-[var(--text-color-light)] font-semibold min-w-[30px] text-right text-sm">
        {currentBST}
      </span>
    </div>
  );
}
