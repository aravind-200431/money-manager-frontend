import React from 'react';
import { useGlobalContext } from '../../context/GlobalContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const renderLabelInside = (data) => ({ x, y, width, height, index }) => {
    const name = data[index]?.name ?? '';
    if (height < 24) return null;
    return (
        <text
            x={x + width / 2}
            y={y + height / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontSize={12}
            fontWeight={600}
        >
            {name}
        </text>
    );
};

const IncomeVsExpenseChart = () => {
    const { stats, loading } = useGlobalContext();

    const data = [
        { name: 'Income', value: stats?.totalIncome ?? 0, className: 'bar-income' },
        { name: 'Expense', value: stats?.totalExpense ?? 0, className: 'bar-expense' },
    ].filter((d) => d.value > 0);

    if (loading && !stats?.totalIncome && !stats?.totalExpense) {
        return (
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[320px] sm:min-h-[380px] flex items-center justify-center text-gray-500 text-sm loading-container loading-pulse">
                Loading…
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[320px] sm:min-h-[380px] flex items-center justify-center text-gray-500 text-sm">
                No income or expense data to display
            </div>
        );
    }

    return (
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[320px] sm:min-h-[380px] chart-container relative">
            <div className="chart-particles">
                <div className="particle" style={{ top: '15%', left: '20%' }}></div>
                <div className="particle" style={{ top: '60%', right: '25%' }}></div>
                <div className="particle" style={{ top: '80%', left: '70%' }}></div>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 text-center chart-title flex items-center justify-center gap-2 relative z-10">
                📊 Income vs Expense
            </h3>
            <div className="w-full h-[260px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 12, right: 16, left: 4, bottom: 8 }}
                        barCategoryGap="25%"
                        barGap={8}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" vertical={false} />
                        <XAxis dataKey="name" tick={false} tickLine={false} axisLine={false} />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            tickFormatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`}
                            width={56}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip 
                            formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']} 
                            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                            contentStyle={{
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                borderRadius: '8px',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                        />
                        <Bar dataKey="value" name="Amount" radius={[6, 6, 0, 0]} label={renderLabelInside(data)} maxBarSize={80}>
                            {data.map((entry, index) => (
                                <Cell key={index} className={entry.className} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default IncomeVsExpenseChart;
