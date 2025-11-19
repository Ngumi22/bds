"use client";

import { useQueryState } from "nuqs";
import { StockStatus } from "@prisma/client";
import { FilterCheckbox } from "./filter-checkbox";

const stockStatusOptions = [
  { value: StockStatus.IN_STOCK, label: "In Stock" },
  { value: StockStatus.OUT_OF_STOCK, label: "Out of Stock" },
];

interface StockStatusFilterProps {
  availableStockStatuses?: Array<{ status: StockStatus; count: number }>;
}

export function StockStatusFilter({
  availableStockStatuses = [],
}: StockStatusFilterProps) {
  const [selectedStatus, setSelectedStatus] = useQueryState("stockStatus", {
    parse: (value) => value.split(",").filter(Boolean) as StockStatus[],
    defaultValue: [],
    shallow: false,
  });

  const handleStatusChange = (status: StockStatus, checked: boolean) => {
    const newStatus = checked
      ? [...selectedStatus, status]
      : selectedStatus.filter((s) => s !== status);

    setSelectedStatus(newStatus.length > 0 ? newStatus : null);
  };

  const statusCounts = new Map(
    availableStockStatuses.map((s) => [s.status, s.count])
  );

  return (
    <div className="pb-6">
      <p className="text-[16px] font-normal">Availability</p>
      <div className="space-y-2 border-t border-border pt-4">
        {stockStatusOptions.map((status) => {
          const count = statusCounts.get(status.value) || 0;
          const labelWithCount = `${status.label} (${count})`;
          const isSelected = selectedStatus.includes(status.value);

          return (
            <FilterCheckbox
              key={status.value}
              id={`status-${status.value}`}
              label={labelWithCount}
              checked={isSelected}
              onCheckedChange={(checked) =>
                handleStatusChange(status.value, checked as boolean)
              }
              disabled={count === 0 && !isSelected}
            />
          );
        })}
      </div>
    </div>
  );
}
