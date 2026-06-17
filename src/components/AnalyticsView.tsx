/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { 
  TrendingUp, 
  Trash2, 
  Eye, 
  Calendar, 
  DollarSign, 
  Activity, 
  X, 
  RotateCcw,
  BarChart3,
  Percent,
  ChevronRight,
  UserCheck
} from "lucide-react";
import { Bill, Product } from "../types";

interface AnalyticsViewProps {
  bills: Bill[];
  onVoidBill: (billId: string) => void;
  formatLKR: (amount: number) => string;
}

export function AnalyticsView({ bills, onVoidBill, formatLKR }: AnalyticsViewProps) {
  const [profitSubTab, setProfitSubTab] = useState<"daily" | "monthly" | "history">("daily");
  
  // Date select state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Month select state
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedMonth, setSelectedMonth] = useState("06"); // June

  // Bill detail state
  const [drilldownBill, setDrilldownBill] = useState<Bill | null>(null);

  // Filter bills by daily date
  const dailyBills = bills.filter((b) => b.dateKey === selectedDate);

  // Aggregate daily financials
  const dailyRev = dailyBills.reduce((sum, b) => sum + b.total, 0);
  const dailyCost = dailyBills.reduce((sum, b) => sum + b.cost, 0);
  const dailyProfit = dailyBills.reduce((sum, b) => sum + b.profit, 0);
  const dailyMargin = dailyRev > 0 ? (dailyProfit / dailyRev) * 100 : 0;

  // Aggregate monthly values
  const monthPrefix = `${selectedYear}-${selectedMonth}`;
  const monthlyBills = bills.filter((b) => b.dateKey.startsWith(monthPrefix));
  
  const monthlyRev = monthlyBills.reduce((sum, b) => sum + b.total, 0);
  const monthlyCost = monthlyBills.reduce((sum, b) => sum + b.cost, 0);
  const monthlyProfit = monthlyBills.reduce((sum, b) => sum + b.profit, 0);
  const monthlyMargin = monthlyRev > 0 ? (monthlyProfit / monthlyRev) * 100 : 0;

  // Group monthly bills by specific days for SVG charting
  const daysInMonth = Array.from({ length: 30 }, (_, i) => {
    const dayNum = String(i + 1).padStart(2, "0");
    const dateKey = `${monthPrefix}-${dayNum}`;
    const dayBills = bills.filter((b) => b.dateKey === dateKey);
    const rev = dayBills.reduce((sum, b) => sum + b.total, 0);
    const cos = dayBills.reduce((sum, b) => sum + b.cost, 0);
    const prf = dayBills.reduce((sum, b) => sum + b.profit, 0);
    return { day: dayNum, dateKey, revenue: rev, cost: cos, profit: prf, billCount: dayBills.length };
  });

  const maxVal = Math.max(...daysInMonth.map((d) => Math.max(d.revenue, d.cost)), 1000);

  // Years list for picker
  const yearsList = ["2026", "2025", "2024"];
  const monthsList = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const handleVoidClick = (id: string) => {
    if (confirm(`VOID BILL ALERT: voiding bill ${id} will restore stock units and completely remove profit tracking. Action is final. Continue?`)) {
      onVoidBill(id);
      if (drilldownBill?.id === id) {
        setDrilldownBill(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual Tab Navigation */}
      <div className="flex bg-slate-100 rounded-2xl p-1 text-xs md:text-sm font-semibold max-w-lg">
        <button
          id="tab-daily-metrics-btn"
          onClick={() => setProfitSubTab("daily")}
          className={`flex-1 px-4 py-2 text-center rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
            profitSubTab === "daily"
              ? "bg-white text-teal-800 shadow-md"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Daily Analysis
        </button>
        <button
          id="tab-monthly-metrics-btn"
          onClick={() => setProfitSubTab("monthly")}
          className={`flex-1 px-4 py-2 text-center rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
            profitSubTab === "monthly"
              ? "bg-white text-teal-800 shadow-md"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Monthly progress
        </button>
        <button
          id="tab-history-metrics-btn"
          onClick={() => setProfitSubTab("history")}
          className={`flex-1 px-4 py-2 text-center rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
            profitSubTab === "history"
              ? "bg-white text-teal-800 shadow-md"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Sales Registry
        </button>
      </div>

      {profitSubTab === "daily" && (
        <div className="space-y-6">
          {/* Daily Date Selector & Metrics */}
          <div className="bg-white border border-slate-200/85 p-5 rounded-2xl shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                <span className="font-display font-bold text-slate-800 text-base">Select Analytics Date</span>
              </div>
              <input
                id="daily-date-select"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50/80 border border-slate-150 p-4 rounded-xl">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total Sales Revenue</div>
                <div className="text-xl font-bold text-slate-800 font-mono mt-1">{formatLKR(dailyRev)}</div>
              </div>
              <div className="bg-slate-50/80 border border-slate-150 p-4 rounded-xl">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total cost of goods</div>
                <div className="text-xl font-bold text-slate-800 font-mono mt-1">{formatLKR(dailyCost)}</div>
              </div>
              <div className="bg-teal-50/50 border border-teal-100 p-4 rounded-xl">
                <div className="text-[11px] font-bold text-teal-600 uppercase tracking-widest">Net Earned profit</div>
                <div className="text-xl font-bold text-teal-800 font-mono mt-1">{formatLKR(dailyProfit)}</div>
              </div>
              <div className="bg-teal-50 hover:bg-teal-100/50 transition p-4 rounded-xl border border-teal-100">
                <div className="text-[11px] font-bold text-teal-600 uppercase tracking-widest">Margin Markup Rate</div>
                <div className="text-xl font-bold text-teal-800 font-mono mt-1">{dailyMargin.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* Daily bills logged */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <h3 className="font-display font-semibold text-slate-800 text-sm mb-4">
              Transactions Saved on {selectedDate}
            </h3>
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider sticky top-0">
                  <tr className="border-b border-slate-150">
                    <th className="py-3 px-4">Bill ID</th>
                    <th className="py-3 px-4">Time Created</th>
                    <th className="py-3 px-4">Unique Items Sold</th>
                    <th className="py-3 px-4 text-right">Cost (LKR)</th>
                    <th className="py-3 px-4 text-right">Revenue (LKR)</th>
                    <th className="py-3 px-4 text-right">Profits (LKR)</th>
                    <th className="py-3 px-4 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white leading-normal">
                  {dailyBills.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No transactions saved on this date.
                      </td>
                    </tr>
                  ) : (
                    dailyBills.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/40 transition">
                        <td className="py-3 px-4 font-bold text-slate-800">{b.id}</td>
                        <td className="py-3 px-4 text-slate-500">
                          {b.date.includes(", ") ? b.date.split(", ")[3] || b.date : b.date}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {b.items.reduce((sum, i) => sum + i.quantity, 0)} units ({b.items.length} titles)
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-500">{formatLKR(b.cost)}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">{formatLKR(b.total)}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-teal-600">{formatLKR(b.profit)}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            id={`view-receipt-${b.id}`}
                            onClick={() => setDrilldownBill(b)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-1 px-2.5 rounded-lg text-[10px] font-bold cursor-pointer transition"
                          >
                            Drill Down
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {profitSubTab === "monthly" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-600" />
                <span className="font-display font-bold text-slate-800 text-base">Monthly Progress Visuals</span>
              </div>

              {/* Month Selector Dropdowns */}
              <div className="flex gap-2.5">
                <select
                  id="monthly-year-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  {yearsList.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>

                <select
                  id="monthly-month-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  {monthsList.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revenue Overall</div>
                <div className="text-lg font-bold text-slate-800 font-mono mt-1">{formatLKR(monthlyRev)}</div>
              </div>
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Costs Total</div>
                <div className="text-lg font-bold text-slate-800 font-mono mt-1">{formatLKR(monthlyCost)}</div>
              </div>
              <div className="bg-teal-50 border border-teal-100 p-4 rounded-xl">
                <div className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">Monthly Profit</div>
                <div className="text-lg font-bold text-teal-800 font-mono mt-1">{formatLKR(monthlyProfit)}</div>
              </div>
              <div className="bg-teal-55/40 border border-teal-105 p-4 rounded-xl">
                <div className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">Margin Gained</div>
                <div className="text-lg font-bold text-teal-800 font-mono mt-1">{monthlyMargin.toFixed(1)}%</div>
              </div>
            </div>

            {/* Render Premium SVG Chart for Month */}
            <div className="mt-6">
              <h4 className="font-semibold text-slate-700 text-xs uppercase tracking-wider mb-3">Daily cost vs. revenue trend</h4>
              <div className="border border-slate-220 bg-slate-50/50 rounded-2xl p-4 md:p-6 shadow-inner relative">
                <div className="h-64 w-full flex items-end gap-1 px-2.5 pb-2 border-b border-slate-300">
                  {daysInMonth.map((d) => {
                    const revHeightPercent = maxVal > 0 ? (d.revenue / maxVal) * 80 : 0;
                    const costHeightPercent = maxVal > 0 ? (d.cost / maxVal) * 80 : 0;
                    
                    return (
                      <div key={d.day} className="flex-1 flex flex-col justify-end items-center h-full group relative">
                        {/* Hover detailed card overlay tooltip */}
                        <div className="absolute bottom-full mb-2 bg-slate-900 text-white rounded-lg p-2.5 hidden group-hover:block z-30 font-mono w-44 shadow-lg pointer-events-none text-[10px] transition leading-relaxed left-1/2 -translate-x-1/2">
                          <p className="font-bold border-b border-slate-700 pb-1.5 mb-1.5 text-slate-300 text-center">Day {d.day} ({d.billCount} bills)</p>
                          <p className="flex justify-between"><span>Revenue:</span> <span className="font-semibold text-teal-400">{formatLKR(d.revenue)}</span></p>
                          <p className="flex justify-between"><span>Cost:</span> <span className="font-semibold text-amber-300">{formatLKR(d.cost)}</span></p>
                          <p className="flex justify-between border-t border-slate-700 pt-1 mt-1 font-bold"><span>Net Profit:</span> <span className="text-white">{formatLKR(d.profit)}</span></p>
                        </div>

                        {/* Revenue Bar Grid (Teal) */}
                        <div 
                          className="w-1.5 bg-teal-500 rounded-t-sm group-hover:bg-teal-600 transition-all cursor-crosshair"
                          style={{ height: `${revHeightPercent}%` }}
                        />
                        {/* Cost Bar Grid (Rose-red) */}
                        <div 
                          className="w-1.5 bg-rose-400 rounded-t-sm group-hover:bg-rose-500 transition-all cursor-crosshair mt-0.5"
                          style={{ height: `${costHeightPercent}%` }}
                        />

                        {/* Text day tracker */}
                        <span className="text-[9px] font-mono text-slate-400 mt-2 font-semibold">
                          {d.day}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-center items-center gap-6 mt-4 text-[10px] font-semibold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-teal-500 rounded-sm inline-block" />
                    <span>Daily Sales Revenue (Teal Bar)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-rose-400 rounded-sm inline-block" />
                    <span>Cost of Goods Sold (Rose Bar)</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 ml-4 italic">Hover over blocks for details</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {profitSubTab === "history" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
          <div className="pb-3 mb-4 border-b border-slate-100">
            <h3 className="font-display font-semibold text-slate-800 text-sm">
              All Saved Bills ({bills.length} bills)
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Double-check or Void/Refund sales securely. Voiding returns stock items to inventory.</p>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl bg-slate-50/50">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-500 uppercase text-[10px] tracking-wider leading-none">
                <tr className="border-b border-slate-200">
                  <th className="py-3 px-4">Bill ID</th>
                  <th className="py-3 px-4">Date/Time Created</th>
                  <th className="py-3 px-4 text-right">Items total</th>
                  <th className="py-3 px-4 text-right">Revenue (LKR)</th>
                  <th className="py-3 px-4 text-right">Net Profit</th>
                  <th className="py-3 px-4 text-center">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {bills.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No bills saved yet. Complete a checkout in the POS screen.
                    </td>
                  </tr>
                ) : (
                  bills
                    .slice()
                    .reverse()
                    .map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-800">{b.id}</td>
                        <td className="py-3.5 px-4 text-slate-500">{b.date}</td>
                        <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                          {b.items.reduce((sum, i) => sum + i.quantity, 0)} items ({b.items.length} unique)
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                          {formatLKR(b.total)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-teal-600 font-mono">
                          {formatLKR(b.profit)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              id={`history-view-${b.id}`}
                              onClick={() => setDrilldownBill(b)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 px-2.5 rounded-lg text-[10px] font-bold cursor-pointer transition flex items-center gap-1"
                              title="View Invoice"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </button>
                            <button
                              id={`history-void-${b.id}`}
                              onClick={() => handleVoidClick(b.id)}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-700 p-1.5 px-2.5 rounded-lg text-[10px] font-bold cursor-pointer transition flex items-center gap-1"
                              title="Void order / Refund stock"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Void
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bill detailed drilldown modal */}
      {drilldownBill && (
        <div id="drilldown-modal-container" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-slate-850 bg-slate-800 text-white px-6 py-4 flex justify-between items-center">
              <span className="font-display font-semibold text-base">Receipt Detail Registry</span>
              <button 
                id="close-drilldown-modal-btn"
                type="button"
                onClick={() => setDrilldownBill(null)} 
                className="text-slate-300 hover:text-white rounded-lg p-1 hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Bill ID</div>
                  <div className="font-mono text-sm font-bold text-slate-800">{drilldownBill.id}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Created Date</div>
                  <div className="text-slate-800 font-medium">{drilldownBill.date}</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-700 uppercase tracking-wider mb-2">Purchased Items List</h4>
                <div className="border border-slate-150 rounded-xl divide-y divide-slate-100 overflow-hidden bg-slate-50">
                  {drilldownBill.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 text-xs bg-white">
                      <div>
                        <div className="font-bold text-slate-800">{it.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {formatLKR(it.price)} per unit
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900 font-mono">
                          {formatLKR(it.price * it.quantity)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Qty: {it.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{formatLKR(drilldownBill.subtotal)}</span>
                </div>
                {drilldownBill.discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount ({drilldownBill.discount}%):</span>
                    <span>-${formatLKR(drilldownBill.subtotal * (drilldownBill.discount / 100))}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Merchant COGS (Cost price of units):</span>
                  <span>{formatLKR(drilldownBill.cost)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-950 font-display">
                  <span>Grand Total Sold value:</span>
                  <span>{formatLKR(drilldownBill.total)}</span>
                </div>
                <div className="flex justify-between text-teal-600 font-bold border-t border-slate-200 pt-2 font-display">
                  <span>Net Earned Profit:</span>
                  <span className="font-mono text-base">{formatLKR(drilldownBill.profit)}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex justify-between gap-3">
              <button
                id="void-bill-inside-detail"
                type="button"
                onClick={() => handleVoidClick(drilldownBill.id)}
                className="px-4 py-2 bg-rose-55 bg-rose-50 hover:bg-rose-100 text-rose-700 text-semibold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer font-bold"
              >
                <X className="w-3.5 h-3.5" />
                Void/Delete Bill
              </button>

              <button
                id="close-detail-modal"
                type="button"
                onClick={() => setDrilldownBill(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-xs transition"
              >
                Close Registry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
