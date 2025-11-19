"use client";

import { useQueryStates, type UseQueryStateOptions } from "nuqs";
import { useMemo, useCallback, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpecificationsFilterProps {
  specifications: Array<{
    key: string;
    values: Array<{ value: string; count: number }>;
  }>;
  defaultShowCount?: number;
}

const formatSpecKey = (key: string) =>
  key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export function SpecificationsFilter({
  specifications,
  defaultShowCount = 5,
}: SpecificationsFilterProps) {
  const queryConfig = useMemo(() => {
    const base: Record<string, UseQueryStateOptions<string[]>> = {};

    specifications.forEach((spec) => {
      base[spec.key] = {
        parse: (v: string) => (v ? v.split(",").filter(Boolean) : []),
        serialize: (v: string[]) => (v && v.length > 0 ? v.join(",") : ""),
      };
    });

    return base;
  }, [specifications]);

  const [query, setQuery] = useQueryStates(queryConfig, {
    shallow: false,
    clearOnDefault: true,
  });

  const [isExpanded, setIsExpanded] = useState(true);

  const filteredSpecifications = useMemo(() => {
    return specifications;
  }, [specifications]);

  const getSelectedValues = useCallback(
    (specKey: string) => {
      return query[specKey] || [];
    },
    [query]
  );

  const handleSpecChange = (
    specKey: string,
    value: string,
    checked: boolean
  ) => {
    const existing = getSelectedValues(specKey);
    let newValues: string[];

    if (checked) {
      newValues = Array.from(new Set([...existing, value]));
    } else {
      newValues = existing.filter((v) => v !== value);
    }

    setQuery({
      [specKey]: newValues.length ? newValues : null,
    });
  };

  if (!specifications || specifications.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full pb-3">
        <p className="text-[16px] font-normal">Specifications</p>
        <ChevronDown
          className="h-4 w-4 transition-transform duration-500"
          style={{ transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)" }}
        />
      </button>

      <div
        className="overflow-hidden transition-all duration-500 ease-out"
        style={{
          maxHeight: isExpanded ? "2000px" : "0px",
          opacity: isExpanded ? 1 : 0,
          transitionDelay: isExpanded ? "50ms" : "0ms",
        }}>
        <div className="space-y-3">
          {filteredSpecifications.map((spec, index) => {
            return (
              <div key={spec.key}>
                <h3 className="text-[13px] font-semibold text-foreground">
                  {formatSpecKey(spec.key)}
                </h3>

                <div className="space-y-3">
                  {spec.values.map((specValue) => {
                    const isChecked = getSelectedValues(spec.key).includes(
                      specValue.value
                    );
                    const isDisabled = specValue.count === 0 && !isChecked;

                    return (
                      <label
                        key={specValue.value}
                        className={cn(
                          "flex items-center gap-1.5 py-1.5 cursor-pointer select-none",
                          isDisabled && "opacity-50 cursor-not-allowed"
                        )}>
                        <Checkbox
                          checked={isChecked}
                          disabled={isDisabled}
                          onCheckedChange={(
                            checked: boolean | "indeterminate"
                          ) =>
                            handleSpecChange(
                              spec.key,
                              specValue.value,
                              checked === true
                            )
                          }
                        />
                        <span
                          className={cn(
                            "text-[13px]",
                            isDisabled
                              ? "text-muted-foreground"
                              : "text-foreground"
                          )}>
                          {specValue.value}
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({specValue.count})
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>

                {index < filteredSpecifications.length - 1 && (
                  <div className="mt-4 border-t border-border" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
