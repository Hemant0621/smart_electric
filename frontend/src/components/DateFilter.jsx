import { useState } from "react";

export default function DateFilter({ Range, Mode }) {
  const [range, setRange] = useState("today");
  const [mode, setMode] = useState("hybrid");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const handleRange = (value) => {
    setRange(value);
    if (value !== "custom") {
      Range({ range: value });
    }
  };
  const handleMode = (value) => {
    setMode(value);
    Mode(value);
  };

  const handleCustomSubmit = () => {
    if (customStart && customEnd) {
      Range({
        range: "custom",
        start_date: customStart,
        end_date: customEnd,
      });
    }
  };

  return (
    <div className="flex gap-4 items-center bg-white shadow p-4 rounded-2xl">
      <select
        value={range}
        onChange={(e) => handleRange(e.target.value)}
        className="block py-2.5 px-0 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-400 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
      >
        <option value="today">Today</option>
        <option value="month">Month</option>
        <option value="year">Year</option>
        <option value="custom">Custom</option>
      </select>

      {range === "custom" && (
        <div className="flex gap-2 items-center">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <button
            onClick={handleCustomSubmit}
            className="bg-blue-500 text-white px-4 py-1 rounded cursor-pointer"
          >
            Apply
          </button>
        </div>
      )}
      <select
        value={mode}
        onChange={(e) => handleMode(e.target.value)}
        className="block py-2.5 px-0 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-400 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
      >
        <option value="hybrid">Hybrid</option>
        <option value="grid">Grid</option>
        <option value="solar">Solar</option>
      </select>
    </div>
  );
}
