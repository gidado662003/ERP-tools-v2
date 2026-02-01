import React, { useState } from "react";

interface DateRangePickerProps {
    onDateChange?: (startDate: string, endDate: string) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ onDateChange }) => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setStartDate(value);
        onDateChange?.(value, endDate);
    };

    const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEndDate(value);
        onDateChange?.(startDate, value);
    };

    return (
        <div>

            <div className="flex items-center gap-3">
                <input
                    type="date"
                    value={startDate}
                    onChange={handleStartChange}
                    max={endDate || undefined}
                    className="border w-full rounded px-3 py-2"
                />

                <span>to</span>

                <input
                    type="date"
                    value={endDate}
                    onChange={handleEndChange}
                    min={startDate || undefined}
                    className="border w-full rounded px-3 py-2"
                />
            </div>
            <div className="mt-2">
                {startDate && endDate && (`${startDate} to ${endDate}`)}

            </div>
        </div>
    );
};

export default DateRangePicker;
