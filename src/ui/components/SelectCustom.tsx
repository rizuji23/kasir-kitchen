import React from "react";
import { cn } from "../lib/utils";

interface SelectCustomProps {
    label?: string,
    value: string; // Current selected value
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void; // Native onChange event
    children: React.ReactNode; // Nested <SelectCustom.Option> components
    disabled?: boolean,
}

const SelectCustom: React.FC<SelectCustomProps> & { Option: React.FC<OptionProps> } = ({ label, value, onChange, children, disabled = false }) => {
    return (
        <>
            <div className="relative">
                {
                    label && <div className="absolute top-0 left-4">
                        <small className="text-default-600 text-xs">{label}</small>
                    </div>
                }
                <select
                    value={value}
                    disabled={disabled}
                    onChange={onChange} // Pass the native event directly
                    className={cn("px-3 w-full inline-flex shadow-sm tap-highlight-transparent group-data-[focus=true]:bg-default-200 rounded-medium flex-col items-start justify-center gap-0 bg-default-100 data-[hover=true]:bg-default-200 outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 py-2 text-sm", label ? "!pt-6 " : "")}
                >
                    {children} {/* Render nested <SelectCustom.Option> components */}
                </select>

            </div>
        </>
    );
};

interface OptionProps {
    value: string; // Value of the option
    children: React.ReactNode; // Display text for the option
}

const Option: React.FC<OptionProps> = ({ value, children }) => {
    return (
        <option value={value}>
            {children}
        </option>
    );
};

// Attach Option as a static property to SelectCustom
SelectCustom.Option = Option;

export default SelectCustom;