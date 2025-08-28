import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import SummaryCard from "./SummaryCard";
import LineChartBox from "./LineChartBox";
import DateFilter from "./DateFilter";
import Settings from "./Settings";

export default function Dashboard() {
  const [chartData, setChartData] = useState([]);
  const [user, setuser] = useState("");
  const [summary, setSummary] = useState({});
  const [range, setRange] = useState({ range: "today" });
  const [mode, setMode] = useState("hybrid");
  const [loading, setLoading] = useState(false);
  const [loaderTextIndex, setLoaderTextIndex] = useState(0);
  const [tab, settab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false); // ✅ NEW: mobile drawer

  const userId = "hemant0621";

  const loaderTexts = [
    "Checking your daily energy usage...",
    "Almost done...",
    "Ohh, I missed your AC!",
    "Finishing up the analysis...",
  ];

  useEffect(() => {
    let intervalId;

    if (loading) {
      intervalId = setInterval(() => {
        setLoaderTextIndex((prev) => (prev + 1) % loaderTexts.length);
      }, 2000);
    } else {
      setLoaderTextIndex(0);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [loading]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const minLoadingTime = 5000;

      const startTime = Date.now();
      try {
        let url = `https://smart-electric.onrender.com/api/energy/graph_analytics?user_id=${userId}&mode=${mode}&range=${range.range}`;
        if (range.range === "custom") {
          url += `&start_date=${range.start_date}&end_date=${range.end_date}`;
        }
        const res = await axios.get(url);
        // Prepare chart data
        const xData = res.data.x_axis;
        const usage = res.data.power_usage || [];
        const solar = res.data.solar_generation || [];

        const formatted = xData.map((x, i) => ({
          x,
          usage: usage[i] || 0,
          solar: solar[i] || 0,
        }));

        setChartData(formatted);
        setSummary(res.data || {});
        setuser(res.data.user_id);
      } catch (err) {
        console.error("Error fetching data:", err);
      }

      const elapsedTime = Date.now() - startTime;
      const remainingTime = minLoadingTime - elapsedTime;
      if (remainingTime > 0) {
        setTimeout(() => {
          setLoading(false);
        }, remainingTime);
      } else {
        setLoading(false);
      }
    };

    fetchData();
  }, [range, mode, userId]);

  return (
    <div className="flex min-h-screen overflow-hidden">
      {loading && (
        <div className="bg-black opacity-80 z-50 fixed inset-0 flex flex-col gap-10 justify-center items-center text-white">
          <img
            className="h-50 md:h-70 lg:h-100 rounded-full"
            src="/Home.gif"
            alt="Loading..."
          />
          <p className=" text-lg md:text-xllg:text-2xl">{loaderTexts[loaderTextIndex]}</p>
        </div>
      )}

      {/* ===== Sidebar ===== */}
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar tab={settab} />
      </div>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[80%] bg-white shadow-2xl z-50">
            <Sidebar
              tab={(val) => {
                settab(val);
                setSidebarOpen(false); // close drawer after selecting a tab
              }}
            />
          </div>
        </div>
      )}

      {/* ===== Main Content ===== */}
      <div className="flex-1 flex flex-col bg-gray-100">
        {/* Topbar + Mobile Hamburger */}
        <div className="flex items-center justify-between bg-white px-4 py-3 shadow md:px-6">
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-200"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1">
            <Topbar user={user} />
          </div>
        </div>

        {tab == "dashboard" ? (
          <div className="p-4 sm:p-6 space-y-6">
            {/* Date Filter */}
            <DateFilter Range={setRange} Mode={setMode} />

            {/* Summary Cards — responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <SummaryCard
                title={`${mode == "solar" ? "Self consumed" : "Power Consumed"}`}
                value={summary?.consumption || 0}
                unit="kWh"
                color="border-blue-500"
              />
              {mode != "grid" && (
                <SummaryCard
                  title="Solar Generated"
                  value={summary?.solar || 0}
                  unit="kWh"
                  color="border-yellow-500"
                />
              )}
              <SummaryCard
                title={`${summary?.cost > 0 ? "Earnings" : "Amount due"}`}
                value={summary?.cost < 0 ? -summary?.cost : summary?.cost || 0}
                unit="₹"
                color="border-green-500"
              />
            </div>

            {/* Charts — already responsive; keep as-is */}
            <div
              className={`grid grid-cols-1 ${
                mode === "hybrid" && "md:grid-cols-2"
              } gap-6`}
            >
              {(mode === "hybrid" || mode === "grid") && (
                <LineChartBox
                  data={chartData}
                  dataKey="usage"
                  color="#3b82f6"
                  title="Power Usage"
                />
              )}
              {(mode === "hybrid" || mode === "solar") && (
                <LineChartBox
                  data={chartData}
                  dataKey="solar"
                  color="#facc15"
                  title="Solar Generation"
                />
              )}
            </div>
          </div>
        ) : (
          <Settings />
        )}
      </div>
    </div>
  );
}
