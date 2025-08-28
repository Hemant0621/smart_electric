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
        let url = `http://127.0.0.1:8000/api/energy/graph_analytics?user_id=${userId}&mode=${mode}&range=${range.range}`;
        if (range.range === "custom") {
          url += `&start_date=${range.start_date}&end_date=${range.end_date}`;
        }
        const res = await axios.get(url);
        console.log("API Response:", res.data);
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
    <div className="flex">
      {loading && (
        <div className="bg-black opacity-80 z-10 absolute inset-0 flex flex-col gap-10 justify-center items-center text-white">
          <img
            className="h-100 rounded-full"
            src="/Home.gif"
            alt="Loading..."
          />
          <p className="text-2xl">{loaderTexts[loaderTextIndex]}</p>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar tab={settab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-100 min-h-screen">
        <Topbar user={user} />

        {tab == "dashboard" ? (
          <div className="p-6 space-y-6">
            {/* Date Filter */}
            <DateFilter Range={setRange} Mode={setMode} />

            {/* Summary Cards */}
            <div className="flex justify-around gap-10">
              <SummaryCard
                title={`${mode == 'solar' ? "Self consumed" : "Power Consumed"}`}
                value={summary?.consumption || 0}
                unit="kWh"
                color="border-blue-500"
              />
              {mode!="grid" && <SummaryCard
                title="Solar Generated"
                value={summary?.solar || 0}
                unit="kWh"
                color="border-yellow-500"
              />}
              <SummaryCard
                title={`${summary?.cost > 0 ? "Earnings" : "Amount due"}`}
                value={summary?.cost < 0 ? -summary?.cost : summary?.cost || 0}
                unit="₹"
                color="border-green-500"
              />
            </div>

            {/* Charts */}
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
          <Settings/>
        )}
      </div>
    </div>
  );
}
