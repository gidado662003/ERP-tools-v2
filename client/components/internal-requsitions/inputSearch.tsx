import React, { useState } from "react";

interface InputSearchProps {
    placeholder?: string;
    onSearch?: (value: string) => void;
}

const InputSearch: React.FC<InputSearchProps> = ({ placeholder = "Search...", onSearch }) => {
    const [value, setValue] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        onSearch?.(e.target.value);
    };

    return (
        <div className="w-full">
            <input
                type="text"
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-[320px] float-right px-3 py-2 border-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
};

export default InputSearch;
