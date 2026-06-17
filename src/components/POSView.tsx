/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, useRef } from "react";
import { 
  Plus, 
  Minus, 
  Trash2, 
  DollarSign, 
  Zap, 
  ShoppingBag, 
  Sparkles,
  Percent
} from "lucide-react";
import { Product, CartItem } from "../types";

interface POSViewProps {
  products: Product[];
  categories: string[];
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onAddQuickSale: (name: string, price: number) => void;
  onUpdateCartQty: (id: string, qty: number) => void;
  onRemoveFromCart: (id: string) => void;
  onClearCart: () => void;
  onCheckout: (discountPercent: number) => void;
}

export function POSView({
  products,
  categories,
  cart,
  onAddToCart,
  onAddQuickSale,
  onUpdateCartQty,
  onRemoveFromCart,
  onClearCart,
  onCheckout,
}: POSViewProps) {
  // Refs for ultra-fast keyboard quick sale additions
  const nameInputRef = useRef<HTMLInputElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);

  // Quick Sale states
  const [quickName, setQuickName] = useState("");
  const [quickPrice, setQuickPrice] = useState("");

  // Discount state
  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const formatLKR = (amount: number) => {
    return new Intl.NumberFormat("si-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleQuickAdd = (e: FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(quickPrice);
    if (!quickName.trim()) {
      alert("Please enter a quick sale item name.");
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Please enter a valid price.");
      return;
    }
    onAddQuickSale(quickName.trim(), priceNum);
    setQuickName("");
    setQuickPrice("");
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 50);
  };

  const handleApplyDiscount = () => {
    const discNum = parseFloat(discountInput);
    if (isNaN(discNum) || discNum < 0 || discNum > 100) {
      alert("Please enter a valid discount percentage between 0 and 100.");
      setDiscountInput("");
      setAppliedDiscount(0);
      return;
    }
    setAppliedDiscount(discNum);
  };

  // Calculate Subtotal & Totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = subtotal * (appliedDiscount / 100);
  const total = subtotal - discountAmount;

  const handleCheckoutClick = () => {
    if (cart.length === 0) {
      alert("Your cart is empty! Please add items before checking out.");
      return;
    }
    onCheckout(appliedDiscount);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Focused Cashier Input Panel */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2">
            <Zap className="w-5 h-5 text-teal-600 fill-teal-100" />
            Active Checkout desk
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Easily ring up catalog goods or custom orders. Anything you sell will be instantly detected and registered to inventory.
          </p>
        </div>

        {/* Quick Sale Strip */}
        <form onSubmit={handleQuickAdd} className="bg-slate-50 border border-slate-200/70 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold text-slate-700 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 fill-teal-100" />
            <span>Interactive Input / Barcode registry</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-6 relative">
              <label htmlFor="quick-sale-name" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Scan or Type Item Name
              </label>
              <input
                ref={nameInputRef}
                id="quick-sale-name"
                type="text"
                list="quick-sale-suggestions"
                value={quickName}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuickName(val);
                  
                  // Auto-populate price if it matches a catalog product
                  const foundProd = products.find(
                    (p) => p.name.toLowerCase() === val.toLowerCase()
                  );
                  if (foundProd) {
                    setQuickPrice(foundProd.salePrice.toString());
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    // Move focus to price input
                    priceInputRef.current?.focus();
                  }
                }}
                placeholder="Ex: Paper, Pen, Notebook or Cable..."
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none transition font-medium"
              />
              <datalist id="quick-sale-suggestions">
                {products.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} - {formatLKR(p.salePrice)}
                  </option>
                ))}
              </datalist>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="quick-sale-price" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Cost Price (LKR)
              </label>
              <input
                ref={priceInputRef}
                id="quick-sale-price"
                type="number"
                value={quickPrice}
                onChange={(e) => setQuickPrice(e.target.value)}
                placeholder="0.00"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none transition font-mono font-bold"
              />
            </div>
            
            <div className="sm:col-span-3 flex items-end">
              <button
                id="quick-sale-add-btn"
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 py-2.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Add & Log
              </button>
            </div>
          </div>
        </form>

        {/* Operational Status Display Infocard */}
        <div className="bg-teal-50/40 border border-teal-500/15 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-teal-800 flex items-center gap-2 mb-2 font-display">
            <Sparkles className="w-4.5 h-4.5 text-teal-600 fill-teal-100" />
            Automated Stock Intelligence Active
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Typing any item name that is <span className="font-bold text-teal-800">completely new</span> to your shop during checkout will automatically register it inside your 
            <span className="font-semibold text-slate-800"> Stock &amp; Inventory Control</span> database!
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-[10px]">
            <div className="bg-white border border-slate-100 rounded-xl p-3">
              <div className="text-slate-400 font-bold uppercase tracking-wide">Known Items</div>
              <div className="text-lg font-bold text-slate-800 font-mono mt-0.5">{products.length}</div>
            </div>
            <div className="bg-white border border-slate-100 rounded-xl p-3">
              <div className="text-slate-400 font-bold uppercase tracking-wide">Active Registered Categories</div>
              <div className="text-lg font-bold text-slate-800 font-mono mt-0.5">{categories.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Shopping Cart Container Panel */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2">
              <span className="inline-flex items-center justify-center bg-teal-50 text-teal-700 w-7 h-7 rounded-lg text-sm font-semibold">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
              Cart Items
            </h2>
          </div>
          {cart.length > 0 && (
            <button
              id="clear-cart-btn"
              onClick={onClearCart}
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer text-xs font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

        {/* Items list inside cart */}
        <div className="min-h-[220px] max-h-[350px] overflow-y-auto mb-6 pr-1 divide-y divide-slate-100 border border-slate-100 rounded-xl bg-slate-50/50 p-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <ShoppingBag className="w-10 h-10 text-slate-300 stroke-1 mb-2" />
              <p className="text-xs font-medium">Shopping Cart is Empty</p>
              <p className="text-[10px] text-slate-400 mt-1">Add computer accessories or stationary from the left panel</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="py-3 px-2 flex items-center justify-between gap-2 bg-white rounded-xl mb-1.5 border border-slate-100">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 truncate" title={item.name}>
                    {item.name}
                  </h4>
                  <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
                    {formatLKR(item.price)} × {item.quantity}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Quantity Controls */}
                  <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                    <button
                      onClick={() => onUpdateCartQty(item.id, item.quantity - 1)}
                      className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-40 transition cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center text-xs font-bold text-slate-700">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateCartQty(item.id, item.quantity + 1)}
                      className="p-1 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Pricing block */}
                  <div className="text-right min-w-[70px]">
                    <span className="text-xs font-bold text-teal-800">
                      {formatLKR(item.price * item.quantity)}
                    </span>
                  </div>

                  {/* Remove action */}
                  <button
                    onClick={() => onRemoveFromCart(item.id)}
                    className="text-slate-300 hover:text-rose-600 p-1 rounded-lg transition cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Financial Details Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-5 space-y-3 font-mono text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span className="font-bold">{formatLKR(subtotal)}</span>
          </div>

          {/* Discount input row */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-150">
            <span className="text-slate-500 font-sans font-semibold">Apply Discount:</span>
            <div className="relative flex-1 max-w-[120px]">
              <span className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-slate-400 text-[10px] font-bold">
                %
              </span>
              <input
                id="discount-input"
                type="number"
                min="0"
                max="100"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                placeholder="0"
                className="w-full text-right bg-white border border-slate-200 rounded-lg px-2 py-1 pr-6 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all font-mono"
              />
            </div>
            <button
              id="apply-discount-btn"
              type="button"
              onClick={handleApplyDiscount}
              className="bg-slate-700 hover:bg-slate-900 text-white rounded-lg px-3 py-1 font-sans text-xs font-semibold cursor-pointer transition flex items-center gap-1"
            >
              <Percent className="w-3 h-3" />
              Apply
            </button>
          </div>

          {appliedDiscount > 0 && (
            <div className="flex justify-between text-rose-600 font-bold">
              <span>Discount ({appliedDiscount}%):</span>
              <span>-{formatLKR(discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-sm font-bold text-slate-800 border-t border-slate-200 pt-3 font-display">
            <span className="font-sans">Grand Total:</span>
            <span className="text-lg text-teal-800">{formatLKR(total)}</span>
          </div>
        </div>

        {/* Large Checkout trigger */}
        <button
          id="checkout-trigger-btn"
          onClick={handleCheckoutClick}
          disabled={cart.length === 0}
          className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-teal-700/10 flex items-center justify-center gap-2.5 transition active:scale-[0.98] cursor-pointer"
        >
          <DollarSign className="w-4 h-4" />
          Checkout & Print Receipt
        </button>
      </div>
    </div>
  );
}
