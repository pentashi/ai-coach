import React, { useState } from 'react';

const initialProgressData = [
  { date: '2025-06-01', weight: 80, squat: 100, bench: 70, deadlift: 120 },
  { date: '2025-06-08', weight: 79, squat: 105, bench: 72, deadlift: 125 },
  { date: '2025-06-15', weight: 78, squat: 110, bench: 75, deadlift: 130 },
];

export default function ProgressTracker() {
  const [progressData] = useState(initialProgressData);
  const latest = progressData[progressData.length - 1];

  return (
    <section
      aria-label="Progress Tracker"
      className="bg-[#1a1a1a] rounded-2xl shadow-[0_0_25px_#0ef4] p-6 sm:p-8 max-w-4xl mx-auto text-gray-100"
    >
      <h2 className="text-3xl font-extrabold text-cyan-400 mb-6 flex items-center gap-2">
        📈 Your Progress Journey
      </h2>

      {/* Latest Snapshot */}
      <div className="bg-[#222] rounded-xl p-5 sm:p-6 mb-8 border border-cyan-700 shadow-inner">
        <h3 className="text-lg sm:text-xl font-bold mb-3 text-cyan-300">
          🔥 Most Recent Performance
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 text-base sm:text-lg">
          <p>
            <span className="text-cyan-500 font-medium">Current Weight:</span> {latest.weight} kg
          </p>
          <p>
            <span className="text-cyan-500 font-medium">Squat Max:</span> {latest.squat} kg
          </p>
          <p>
            <span className="text-cyan-500 font-medium">Bench Press:</span> {latest.bench} kg
          </p>
          <p>
            <span className="text-cyan-500 font-medium">Deadlift Power:</span> {latest.deadlift} kg
          </p>
        </div>
      </div>

      {/* Progress History */}
      <div className="overflow-x-auto rounded-xl">
        <h3 className="text-cyan-300 text-lg font-semibold mb-4">
          📅 Progress History
        </h3>
        <table className="w-full text-sm sm:text-base text-center border-collapse">
          <thead>
            <tr className="bg-[#0ef2] text-black font-bold">
              <th className="py-3 px-2">Session Date</th>
              <th className="py-3 px-2">Weight</th>
              <th className="py-3 px-2">Squat</th>
              <th className="py-3 px-2">Bench</th>
              <th className="py-3 px-2">Deadlift</th>
            </tr>
          </thead>
          <tbody>
            {progressData.map(({ date, weight, squat, bench, deadlift }) => (
              <tr key={date} className="border-b border-gray-700 hover:bg-[#2a2a2a] transition">
                <td className="py-2 px-2">{date}</td>
                <td className="py-2 px-2">{weight} kg</td>
                <td className="py-2 px-2">{squat} kg</td>
                <td className="py-2 px-2">{bench} kg</td>
                <td className="py-2 px-2">{deadlift} kg</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
