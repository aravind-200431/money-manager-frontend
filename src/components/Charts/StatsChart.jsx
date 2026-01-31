import React, { useState, useEffect } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

import { useGlobalContext } from '../../context/GlobalContext';

const COLORS = ['#f97316', '#eab308', '#22c55e', '#14b8a6', '#ea580c', '#dc2626'];

const RADIAN = Math.PI / 180;
const renderLabelInside = (isMobile) => ({ percent, cx, cy, midAngle, innerRadius, outerRadius }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const pct = percent != null ? `${(percent * 100).toFixed(0)}%` : '';
    const fontSize = isMobile ? 11 : 14;
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={fontSize} fontWeight={700}>
            {pct}
        </text>
    );
};

const StatsChart = () => {
    const { categorySummary } = useGlobalContext();
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 640);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const data = categorySummary
        .filter(c => c.type === 'EXPENSE')
        .map(c => ({ name: c.category ? c.category.charAt(0).toUpperCase() + c.category.slice(1).toLowerCase() : '', value: c.totalAmount }));

    if (!data || data.length === 0) {
        return (
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[320px] sm:min-h-[380px] flex items-center justify-center text-gray-500 text-sm sm:text-base">
                No expense data to display
            </div>
        );
    }

    const outerRadius = isMobile ? 72 : 90;
    const margin = isMobile
        ? { top: 8, right: 8, left: 8, bottom: 48 }
        : { top: 10, right: 10, left: 10, bottom: 56 };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[320px] sm:min-h-[380px]">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 text-center">Expense by Category</h3>
            <div className="w-full h-[260px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                   <RadarChart
    data={data}
    outerRadius={isMobile ? "70%" : "85%"}
>
    <defs>
        <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#ea580c" stopOpacity={0.8} />
        </linearGradient>
    </defs>

    <PolarGrid stroke="#e5e7eb" />

    <PolarAngleAxis
        dataKey="name"
        tick={{ fill: "#374151", fontSize: isMobile ? 10 : 12 }}
    />

    <PolarRadiusAxis
        tick={{ fill: "#6b7280", fontSize: 10 }}
    />

    <Radar
        name="Expense"
        dataKey="value"
        stroke="#f97316"
        strokeWidth={3}
        fill="url(#radarGradient)"
        fillOpacity={0.7}
        isAnimationActive={true}
        animationDuration={1200}
    />

    <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
    <Legend />
</RadarChart>


                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default StatsChart;
