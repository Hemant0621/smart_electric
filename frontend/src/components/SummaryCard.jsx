export default function SummaryCard({ title, value, unit, color }) {
  return (
    <div className={`rounded-2xl w-full shadow p-5 bg-white border-l-4 ${color}`}>
      <h2 className="text-gray-500 text-sm">{title}</h2>
      <p className="text-2xl font-bold">
        {value} <span className="text-sm">{unit}</span>
      </p>
    </div>
  );
}
