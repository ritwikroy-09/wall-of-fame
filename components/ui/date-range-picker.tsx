"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
  className?: string;
  placeholder?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
}

export function DateRangePicker({
  date,
  onDateChange,
  className,
  placeholder = "Select date range",
  align = "start",
  side = "bottom",
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align} side={side}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(selectedDate) => {
              onDateChange(selectedDate);
              if (selectedDate?.from && selectedDate?.to) {
                setIsOpen(false);
              }
            }}
            numberOfMonths={2}
            className="rounded-md border"
          />
          {date && (
            <div className="flex items-center justify-between p-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onDateChange(undefined);
                }}
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                Apply
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
