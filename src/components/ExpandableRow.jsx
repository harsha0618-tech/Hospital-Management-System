import { useState } from "react";

function ExpandableRow({ baseCells, expandableItems, itemRenderer, colSpan }) {
  const [expanded, setExpanded] = useState(false);

  const hasItems = expandableItems && expandableItems.length > 0;

  return (
    <>
      <tr
        className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
        onClick={() => hasItems && setExpanded(!expanded)}
      >
        {baseCells.map((cell, idx) => (
          <td key={idx} className="px-4 py-3 whitespace-nowrap">
            {cell}
          </td>
        ))}
        <td className="px-4 py-3 text-gray-400 text-xs">
          {hasItems ? (expanded ? "▲ Hide" : `▼ ${expandableItems.length} item(s)`) : "—"}
        </td>
      </tr>

      {expanded && hasItems && (
        <tr>
          <td colSpan={colSpan} className="bg-gray-50 px-4 py-3">
            <div className="flex flex-col gap-2">
              {expandableItems.map((item, idx) => (
                <div key={idx}>{itemRenderer(item, idx)}</div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default ExpandableRow;