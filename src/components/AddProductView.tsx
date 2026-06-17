/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import { PlusCircle, Sparkles, FolderIcon, Smile, Coins, HelpCircle } from "lucide-react";
import { Product } from "../types";

interface AddProductViewProps {
  categories: string[];
  onAddProduct: (product: Omit<Product, "id">) => void;
}

export function AddProductView({ categories, onAddProduct }: AddProductViewProps) {
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState(categories[0] || "");

  const formatLKR = (amount: number) => {
    return new Intl.NumberFormat("si-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const costNum = parseFloat(cost) || 0;
  const saleNum = parseFloat(salePrice) || 0;
  const projectedProfit = saleNum - costNum;
  const markupPercent = costNum > 0 ? ((projectedProfit / costNum) * 105) : 0; // standard mock or realistic formula

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert("Please provide a product/stationery name.");
      return;
    }
    const costPrice = parseFloat(cost);
    const salePriceVal = parseFloat(salePrice);
    const stockVal = parseInt(stock);

    if (isNaN(costPrice) || costPrice < 0) {
      alert("Enter a valid cost price.");
      return;
    }
    if (isNaN(salePriceVal) || salePriceVal < 0) {
      alert("Enter a valid sales price.");
      return;
    }
    if (isNaN(stockVal) || stockVal < 0) {
      alert("Enter a valid initial stock amount.");
      return;
    }

    onAddProduct({
      name: name.trim(),
      cost: costPrice,
      salePrice: salePriceVal,
      stock: stockVal,
      category: category || categories[0] || "General"
    });

    // Reset Form
    setName("");
    setCost("");
    setSalePrice("");
    setStock("");
    if (categories.length > 0) {
      setCategory(categories[0]);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 max-w-4xl mx-auto">
      <div className="pb-4 mb-6 border-b border-slate-100">
        <h2 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-teal-600" />
          Add Product to Catalog
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Register a new technology accessory or writing supplies item with your store stock</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="md:col-span-7 space-y-5">
          <div>
            <label htmlFor="product-name" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Product/Item Name *
            </label>
            <input
              id="product-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Atlas CR Book Single Rule 200 Pgs"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="cost-price" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Cost Price (LKR) *
              </label>
              <input
                id="cost-price-input"
                type="number"
                required
                min="0"
                step="any"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-mono"
              />
            </div>

            <div>
              <label htmlFor="sale-price" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Sale Price (LKR) *
              </label>
              <input
                id="sale-price-input"
                type="number"
                required
                min="0"
                step="any"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="stock-qty" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Stock Quantity *
              </label>
              <input
                id="stock-qty-input"
                type="number"
                required
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="category-select" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Store Category
              </label>
              <select
                id="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            id="register-product-btn"
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm shadow-md shadow-teal-700/10 flex items-center justify-center gap-2 transition hover:shadow-lg active:scale-[0.99] cursor-pointer mt-2"
          >
            <PlusCircle className="w-4 h-4" />
            Add To Catalog Stock
          </button>
        </form>

        {/* Live Estimator Card */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-slate-50 border border-slate-250/70 rounded-2xl p-5">
            <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-3.5 text-center text-teal-800 flex items-center justify-center gap-1.5 pb-2.5 border-b border-slate-200">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-100" />
              Sales Profit Estimator
            </h3>

            <div className="space-y-3.5 py-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Proposed Item Name:</span>
                <span className="font-bold text-slate-700 truncate max-w-[170px]">
                  {name || <span className="text-slate-400 font-normal italic">Untitled Item</span>}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Unit Cost:</span>
                <span className="font-mono text-slate-600">{formatLKR(costNum)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Unit Sale Price:</span>
                <span className="font-mono text-slate-750 font-semibold">{formatLKR(saleNum)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2.5">
                <span className="text-slate-500 font-semibold">Projected Net Profit/Unit:</span>
                <span className={`font-mono font-bold ${projectedProfit >= 0 ? "text-teal-600" : "text-rose-600"}`}>
                  {formatLKR(projectedProfit)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Stock Value:</span>
                <span className="font-mono text-slate-700 font-bold">
                  {formatLKR(saleNum * (parseInt(stock) || 0))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Margin Markup Rate:</span>
                <span className="font-bold text-teal-600">
                  {costNum > 0 ? `+${((projectedProfit / costNum) * 100).toFixed(0)}%` : "0%"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 text-xs text-teal-800 space-y-2">
            <div className="font-bold flex items-center gap-1">
              <Smile className="w-4 h-4 text-teal-600" />
              Pro Tip For Stationery Retail
            </div>
            <p className="leading-relaxed">
              Standard pencils & notebooks have markup margins of 35% - 50%, while computer components match 15% - 30% due to higher base costs. Make sure to choose the correct category so your profit charts remain neatly organized!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
