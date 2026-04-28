"use client";
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, MapPin, X, ChevronDown, AlertTriangle } from "lucide-react";
import { locationApi } from "@/lib/location/locationApi";
import { Location, LocationType } from "@/lib/location/locationType";

interface LocationSelectProps {
  onSelect: (location: Location | null) => void;
  placeholder?: string;
  label?: string;
  onChangeValue?: (location: string | null) => void;
  allowedTypes?: LocationType[];
  disabled?: boolean;
}

function LocationSelect({
  onChangeValue,
  onSelect,
  placeholder = "Search locations...",
  label = "Location",
  allowedTypes,
  disabled,
}: LocationSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(true);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const searchTermRef = useRef(searchTerm);

  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);

  const updateDropdownPosition = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  };

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      onChangeValue?.(searchTerm || null);
      try {
        const data = await locationApi.getLocations({ search: searchTerm });
        setLocations(data);
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, [searchTerm, onChangeValue]);

  useEffect(() => {
    const handler = async (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        const currentSearch = searchTermRef.current;
        if (!currentSearch) return;
        const location = await locationApi.getLocationByName(currentSearch);
        setValid(!!location);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const reposition = () => updateDropdownPosition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [isOpen]);

  const handleSelect = (location: Location) => {
    setSelectedLocation(location);
    setSearchTerm(location.name);
    setIsOpen(false);
    setValid(true);
    onSelect(location);
  };

  const handleClear = () => {
    setSelectedLocation(null);
    setSearchTerm("");
    setIsOpen(false);
    setValid(true);
    onSelect(null);
    onChangeValue?.(null);
  };

  const filteredLocations =
    allowedTypes && allowedTypes.length > 0
      ? locations.filter((loc) => allowedTypes.includes(loc.type))
      : locations;

  const dropdown = (
    <div
      style={dropdownStyle}
      className="rounded-md border border-gray-200 bg-white shadow-lg overflow-hidden"
    >
      {filteredLocations.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <MapPin className="h-6 w-6 text-gray-300" />
          <p className="text-xs text-gray-400">
            {searchTerm
              ? `No locations matching "${searchTerm}"`
              : "No locations found"}
          </p>
        </div>
      ) : (
        <ul className="max-h-56 overflow-y-auto py-1">
          {filteredLocations.map((location) => (
            <li
              key={location._id}
              onMouseDown={() => handleSelect(location)}
              className={`
                flex items-center gap-3 px-3 py-2 cursor-pointer text-sm
                transition-colors duration-100
                ${
                  selectedLocation?._id === location._id
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-50"
                }
              `}
            >
              <div
                className={`
                  h-1.5 w-1.5 rounded-full shrink-0
                  ${selectedLocation?._id === location._id ? "bg-indigo-500" : "bg-gray-300"}
                `}
              />
              <span className="truncate">{location.name}</span>
            </li>
          ))}
        </ul>
      )}
      {filteredLocations.length > 0 && (
        <div className="border-t border-gray-100 px-3 py-1.5">
          <p className="text-[11px] text-gray-400">
            {filteredLocations.length} location
            {filteredLocations.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div ref={containerRef} className="relative w-full">
      {label ? (
        <label className="block text-xs font-medium text-gray-500 mb-1.5 tracking-wide uppercase">
          {label}
        </label>
      ) : null}

      <div
        className={`
          relative flex items-center w-full rounded-md border bg-white
          transition-all duration-150
          ${
            isOpen
              ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm"
              : !valid
                ? "border-amber-400 ring-2 ring-amber-400/20 shadow-sm"
                : "border-gray-200 hover:border-gray-300 shadow-sm"
          }
        `}
      >
        <div className="pl-3 pr-2 text-gray-400 shrink-0">
          {loading ? (
            <div className="h-3.5 w-3.5 rounded-full border-2 border-gray-300 border-t-indigo-500 animate-spin" />
          ) : (
            <Search className="h-3.5 w-3.5" />
          )}
        </div>

        <input
          type="text"
          value={searchTerm}
          placeholder={placeholder}
          onFocus={() => {
            if (disabled) return;
            updateDropdownPosition();
            setIsOpen(true);
          }}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setSelectedLocation(null);
            setIsOpen(true);
            setValid(true);
          }}
          disabled={disabled}
          className="flex-1 py-2 pr-2 text-sm bg-transparent outline-none placeholder:text-gray-400 text-gray-800"
        />

        <div className="pr-2.5 flex items-center gap-1 shrink-0">
          {selectedLocation && (
            <button
              onMouseDown={handleClear}
              disabled={disabled}
              className="p-0.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown
            className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {!valid && (
        <p className="text-xs text-amber-600 flex items-center gap-1 mt-1.5">
          <AlertTriangle className="h-3 w-3" />
          Location not found. Create it from the locations endpoint first.
        </p>
      )}
      {isOpen && createPortal(dropdown, document.body)}
    </div>
  );
}

export default LocationSelect;
