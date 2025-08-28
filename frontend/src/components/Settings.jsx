import { useState } from "react";
import axios from "axios";

export default function Settings() {
  const [gridRate, setGridRate] = useState("");
  const [solarRate, setSolarRate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = {
        grid_rate: Number(gridRate),
        solar_rate: Number(solarRate),
      };

      const response = await axios.post(
        "https://smart-electric.onrender.com/api/energy/tariff/update/",
        payload
      );

      if (response.status === 200 || response.status === 201) {
        setMessage("Tariff rates updated successfully.");
      } else {
        setMessage("Failed to update tariff rates.");
      }
    } catch (error) {
      setMessage("Error updating tariff rates: " + error.message);
    }

    setLoading(false);
  };

  return (
    <div className="w-full h-full pt-10 p-6 bg-white">
      <h2 className="text-xl font-semibold mb-4">Update Tariff Rates</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="gridRate" className="block text-sm font-medium text-gray-700">
            Grid Electricity Rate (₹ / kWh)
          </label>
          <input
            type="number"
            id="gridRate"
            min="0"
            step="any"
            value={gridRate}
            onChange={(e) => setGridRate(e.target.value)}
            required
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            placeholder="Enter grid rate"
          />
        </div>

        <div>
          <label htmlFor="solarRate" className="block text-sm font-medium text-gray-700">
            Solar Electricity Rate (₹ / kWh)
          </label>
          <input
            type="number"
            id="solarRate"
            min="0"
            step="any"
            value={solarRate}
            onChange={(e) => setSolarRate(e.target.value)}
            required
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            placeholder="Enter solar rate"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 font-semibold text-white rounded-md ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Updating..." : "Update Rates"}
        </button>
      </form>

      {message && <p className="mt-4 text-center text-sm text-red-600">{message}</p>}
    </div>
  );
}
