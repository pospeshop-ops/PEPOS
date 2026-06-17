/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Warehouse, 
  PlusCircle, 
  TrendingUp, 
  PenTool, 
  Lock, 
  HelpCircle,
  Calendar,
  Sparkles,
  Info,
  Download
} from "lucide-react";

import { Product, CartItem, Bill, BillItem } from "./types";
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_BILLS } from "./data";
import { POSView } from "./components/POSView";
import { InventoryView } from "./components/InventoryView";
import { AddProductView } from "./components/AddProductView";
import { AnalyticsView } from "./components/AnalyticsView";
import { PrintInvoiceModal } from "./components/PrintInvoiceModal";

export default function App() {
  const [activeTab, setActiveTab] = useState<"pos" | "inventory" | "addProduct" | "analytics">("pos");
  
  // App States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  
  // Printable modal state
  const [recentBill, setRecentBill] = useState<Bill | null>(null);

  // Modes & Notifications for high operational density
  const [managerMode, setManagerMode] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      showToastForDuration("App successfully installed to your device!", "success");
    }
    setDeferredPrompt(null);
  };

  const showToastForDuration = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Load initial data from localStorage or from pre-populated files
  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem("pe_store_products");
      const storedCategories = localStorage.getItem("pe_store_categories");
      const storedBills = localStorage.getItem("pe_store_bills");

      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      } else {
        setProducts(INITIAL_PRODUCTS);
        localStorage.setItem("pe_store_products", JSON.stringify(INITIAL_PRODUCTS));
      }

      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      } else {
        setCategories(INITIAL_CATEGORIES);
        localStorage.setItem("pe_store_categories", JSON.stringify(INITIAL_CATEGORIES));
      }

      if (storedBills) {
        setBills(JSON.parse(storedBills));
      } else {
        setBills(INITIAL_BILLS);
        localStorage.setItem("pe_store_bills", JSON.stringify(INITIAL_BILLS));
      }
    } catch (err) {
      console.error("Failed loading data from local storage, defaults used.", err);
      setProducts(INITIAL_PRODUCTS);
      setCategories(INITIAL_CATEGORIES);
      setBills(INITIAL_BILLS);
    }
  }, []);

  // Save states to local storage
  const saveProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    localStorage.setItem("pe_store_products", JSON.stringify(updatedProducts));
  };

  const saveCategories = (updatedCategories: string[]) => {
    setCategories(updatedCategories);
    localStorage.setItem("pe_store_categories", JSON.stringify(updatedCategories));
  };

  const saveBills = (updatedBills: Bill[]) => {
    setBills(updatedBills);
    localStorage.setItem("pe_store_bills", JSON.stringify(updatedBills));
  };

  const formatLKR = (amount: number) => {
    return new Intl.NumberFormat("si-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // --- Cart Operations ---
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert("This item is out of stock!");
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Remaining stock is limited to ${product.stock} units.`);
          return prevCart;
        }
        return prevCart.map((item) => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [
          ...prevCart,
          {
            id: product.id,
            name: product.name,
            price: product.salePrice,
            cost: product.cost,
            quantity: 1,
          },
        ];
      }
    });
  };

  const handleAddQuickSale = (name: string, price: number) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    // Check if product already exists in stock catalog (case-insensitive)
    const existingProduct = products.find(
      (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingProduct) {
      // It exists! Add the catalog product to the cart directly
      handleAddToCart(existingProduct);
      showToastForDuration(`Item "${existingProduct.name}" found in catalog. Added unit to cart.`);
      return;
    }

    // It is a completely new item! Auto-register to system inventory
    const newId = `prod-${Date.now()}`;
    const calculatedCost = Math.round(price * 0.7);

    // Ensure the "Quick Register" category exists in categories
    let updatedCategories = [...categories];
    if (!categories.includes("Quick Register")) {
      updatedCategories = ["Quick Register", ...categories];
      saveCategories(updatedCategories);
    }

    const newProduct: Product = {
      id: newId,
      name: trimmedName,
      cost: calculatedCost,
      salePrice: price,
      stock: 100, // Safe default operational stock level for new items
      category: "Quick Register",
    };

    // Save to continuous persistent storage
    const updatedProducts = [...products, newProduct];
    saveProducts(updatedProducts);

    // Save to active transaction cart
    setCart((prevCart) => [
      ...prevCart,
      {
        id: newId,
        name: trimmedName,
        price,
        cost: calculatedCost,
        quantity: 1,
      },
    ]);

    // Show a highly professional, non-intrusive on-screen success prompt
    showToastForDuration(`New item "${trimmedName}" detected & registered to inventory with 100 units!`);
  };

  const handleUpdateCartQty = (id: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveFromCart(id);
      return;
    }

    // If it's a catalog product, check stock boundaries
    const targetProduct = products.find((p) => p.id === id);
    if (targetProduct && qty > targetProduct.stock) {
      alert(`Insufficient stock. Only ${targetProduct.stock} units are available.`);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    );
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // --- POS Checkout & Stock deduction ---
  const handleCheckout = (discountPercent: number) => {
    try {
      // Generate Next Bill ID based on existing bills list
      // Parse highest numeric suffix
      const suffixList = bills
        .map((b) => parseInt(b.id.replace("BILL-", "")))
        .filter((n) => !isNaN(n));
      const nextNum = suffixList.length > 0 ? Math.max(...suffixList) + 1 : 1001;
      const nextBillId = `BILL-${nextNum}`;

      // Date calculations
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      };
      const presentDateStr = now.toLocaleDateString("si-LK", options);
      const dateKeyStr = now.toISOString().split("T")[0]; // YYYY-MM-DD format

      // Product stock decr, subtotal/cost calculations
      let billCost = 0;
      let billSubtotal = 0;
      const billItems: BillItem[] = [];

      const updatedProducts = products.map((prod) => {
        const cartMatch = cart.find((item) => item.id === prod.id);
        if (cartMatch) {
          billCost += prod.cost * cartMatch.quantity;
          billSubtotal += prod.salePrice * cartMatch.quantity;
          billItems.push({
            name: prod.name,
            quantity: cartMatch.quantity,
            price: prod.salePrice,
            cost: prod.cost
          });
          return {
            ...prod,
            stock: Math.max(0, prod.stock - cartMatch.quantity),
          };
        }
        return prod;
      });

      // Include potential quick-sale items in totals
      cart.forEach((cItem) => {
        if (cItem.id.startsWith("quick-")) {
          billCost += cItem.cost * cItem.quantity;
          billSubtotal += cItem.price * cItem.quantity;
          billItems.push({
            name: cItem.name,
            quantity: cItem.quantity,
            price: cItem.price,
            cost: cItem.cost
          });
        }
      });

      const totalValue = billSubtotal * (1 - discountPercent / 100);
      const profitValue = totalValue - billCost;

      const newBill: Bill = {
        id: nextBillId,
        date: presentDateStr,
        dateKey: dateKeyStr,
        items: billItems,
        discount: discountPercent,
        subtotal: billSubtotal,
        total: totalValue,
        cost: billCost,
        profit: profitValue,
      };

      // save all states
      saveProducts(updatedProducts);
      saveBills([...bills, newBill]);
      
      // trigger print preview modal
      setRecentBill(newBill);
      
      // Flush shopping cart
      setCart([]);
    } catch (err) {
      console.error(err);
      alert("Error occurred while executing checkout. Please try again.");
    }
  };

  // --- Inventory Actions ---
  const handleAddProduct = (newProd: Omit<Product, "id">) => {
    const id = `prod-${Date.now()}`;
    const productInstance: Product = { id, ...newProd };
    const newList = [...products, productInstance];
    saveProducts(newList);
    alert(`Success: "${newProd.name}" added to store catalog.`);
  };

  const handleUpdateProduct = (updatedProd: Product) => {
    const updatedList = products.map((p) => (p.id === updatedProd.id ? updatedProd : p));
    saveProducts(updatedList);
  };

  const handleDeleteProduct = (id: string) => {
    const updatedList = products.filter((p) => p.id !== id);
    saveProducts(updatedList);
  };

  const handleAddCategory = (catName: string) => {
    if (categories.includes(catName)) return;
    const updated = [...categories, catName];
    saveCategories(updated);
  };

  const handleRemoveCategory = (catName: string) => {
    const updated = categories.filter((c) => c !== catName);
    saveCategories(updated);
    
    // Safely update category values of cataloged items matching this category
    const updatedProducts = products.map((p) => 
      p.category === catName ? { ...p, category: updated[0] || "General" } : p
    );
    saveProducts(updatedProducts);
  };

  // --- Void sales / restore stock ---
  const handleVoidBill = (billId: string) => {
    const targetBill = bills.find((b) => b.id === billId);
    if (!targetBill) return;

    // Loop through bill items and increment corresponding target products back
    const updatedProducts = products.map((p) => {
      const match = targetBill.items.find((item) => item.name === p.name);
      if (match) {
        return {
          ...p,
          stock: p.stock + match.quantity,
        };
      }
      return p;
    });

    const filteredBills = bills.filter((b) => b.id !== billId);
    
    saveProducts(updatedProducts);
    saveBills(filteredBills);
    
    alert(`Bill ${billId} has been voided. Stocks restored.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Visual Ambient Header */}
      <header className="bg-[#0f172a] text-slate-100 border-b border-teal-950 px-6 py-5 shadow-lg relative overflow-hidden">
        {/* Abstract shapes in the background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center md:text-left">
            <div className="bg-teal-600/90 text-slate-100 p-3 rounded-2xl shadow-md border border-teal-500/35">
              <PenTool className="w-6 h-6 stroke-2" />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className="font-display font-black text-2xl tracking-normal bg-gradient-to-r from-teal-400 to-indigo-300 bg-clip-text text-transparent">
                  PE COMPUTERS & BOOKSHOP
                </span>
                <span className="bg-teal-500/20 text-teal-300 font-bold px-2 py-0.5 rounded-full text-[10px] select-none tracking-wider uppercase border border-teal-500/20">
                  POS Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium"> Sri Lankan Stationery Writing Supplies & Technology Accessories Hub </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 font-mono">
            {deferredPrompt && (
              <button
                id="pwa-install-header-btn"
                onClick={handleInstallClick}
                className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-100 border border-teal-400/20 rounded-xl px-4 py-2.5 shadow-md shadow-teal-900/40 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="w-3.5 h-3.5 text-white" />
                <span>Install PC / Mobile App</span>
              </button>
            )}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5">
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
              <span>Sri Lanka: LKR Prices Enabled</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Tab Links */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex overflow-x-auto gap-1">
            <button
              id="tab-pos-link"
              onClick={() => setActiveTab("pos")}
              className={`py-4 px-5 text-sm font-semibold transition whitespace-nowrap border-b-2 font-display cursor-pointer flex items-center gap-2 ${
                activeTab === "pos"
                  ? "border-teal-600 text-teal-700 font-bold bg-teal-50/15"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-teal-600" />
              Point Of Sale (Checkout)
            </button>
            
            {managerMode && (
              <>
                <button
                  id="tab-inventory-link"
                  onClick={() => setActiveTab("inventory")}
                  className={`py-4 px-5 text-sm font-semibold transition whitespace-nowrap border-b-2 font-display cursor-pointer flex items-center gap-2 ${
                    activeTab === "inventory"
                      ? "border-teal-600 text-teal-700 font-bold bg-teal-50/15"
                      : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                  }`}
                >
                  <Warehouse className="w-4 h-4 text-teal-600" />
                  Stock & Inventory Control
                </button>

                <button
                  id="tab-addproduct-link"
                  onClick={() => setActiveTab("addProduct")}
                  className={`py-4 px-5 text-sm font-semibold transition whitespace-nowrap border-b-2 font-display cursor-pointer flex items-center gap-2 ${
                    activeTab === "addProduct"
                      ? "border-teal-600 text-teal-700 font-bold bg-teal-50/15"
                      : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                  }`}
                >
                  <PlusCircle className="w-4 h-4 text-teal-600" />
                  Add New Product
                </button>

                <button
                  id="tab-analytics-link"
                  onClick={() => setActiveTab("analytics")}
                  className={`py-4 px-5 text-sm font-semibold transition whitespace-nowrap border-b-2 font-display cursor-pointer flex items-center gap-2 ${
                    activeTab === "analytics"
                      ? "border-teal-600 text-teal-700 font-bold bg-teal-50/15"
                      : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                  }`}
                >
                  <TrendingUp className="w-4 h-4 text-teal-600" />
                  Analytics & Sales Registry
                </button>
              </>
            )}
          </div>

          {/* Dedicated Cashier Status / Mode selector to keep teller focused only on sale */}
          <div className="py-2.5 md:py-0 flex items-center justify-end gap-2 text-xs font-semibold select-none">
            <span className={`transition ${!managerMode ? "text-teal-600 font-bold" : "text-slate-400"}`}>
              🛒 Cashier (Locked)
            </span>
            <button
              id="mode-switch-toggle"
              onClick={() => {
                const nextMode = !managerMode;
                setManagerMode(nextMode);
                if (!nextMode) {
                  setActiveTab("pos"); // instantly fallback to main Point Of Sale
                  showToastForDuration("Switched to Teller Mode. Screen focused on Sales only.", "info");
                } else {
                  showToastForDuration("Switched to Manager Mode. Admin tabs unlocked.", "info");
                }
              }}
              className={`w-10 h-5.5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 outline-none ${
                managerMode ? "bg-teal-600" : "bg-slate-300"
              }`}
              title="Toggle Manager View"
            >
              <div
                className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200 ${
                  managerMode ? "translate-x-4.5" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`transition ${managerMode ? "text-slate-800 font-bold" : "text-slate-400"}`}>
              ⚙️ Manager Panel
            </span>
          </div>
        </div>
      </div>

      {/* Main Content container body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 pb-20">
        {activeTab === "pos" && (
          <POSView
            products={products}
            categories={categories}
            cart={cart}
            onAddToCart={handleAddToCart}
            onAddQuickSale={handleAddQuickSale}
            onUpdateCartQty={handleUpdateCartQty}
            onRemoveFromCart={handleRemoveFromCart}
            onClearCart={handleClearCart}
            onCheckout={handleCheckout}
          />
        )}

        {activeTab === "inventory" && (
          <InventoryView
            products={products}
            categories={categories}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onAddCategory={handleAddCategory}
            onRemoveCategory={handleRemoveCategory}
          />
        )}

        {activeTab === "addProduct" && (
          <AddProductView
            categories={categories}
            onAddProduct={handleAddProduct}
          />
        )}

        {activeTab === "analytics" && (
          <AnalyticsView
            bills={bills}
            onVoidBill={handleVoidBill}
            formatLKR={formatLKR}
          />
        )}
      </main>

      {/* Printable Receipt Modal */}
      {recentBill && (
        <PrintInvoiceModal
          bill={recentBill}
          onClose={() => setRecentBill(null)}
        />
      )}

      {/* Dynamic Toast Status Notifications */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-slate-100 border border-teal-500/30 px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce max-w-sm">
          <div className="bg-teal-500/10 p-2 rounded-xl text-teal-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-teal-400 text-xs tracking-wide uppercase">System Registry update</div>
            <div className="text-xs text-slate-200 font-medium mt-0.5">{toast.message}</div>
          </div>
        </div>
      )}

      {/* Aesthetic Footer strip */}
      <footer className="bg-slate-900 text-slate-400 py-6 px-6 text-center text-xs border-t border-slate-800 mt-auto font-mono">
        <p className="font-semibold text-slate-300">
          PE COMPUTERS & BOOKSHOP • Porowagama Naranovita Sri Lanka • Tel: 070 607 7607
        </p>
        <p className="mt-1 text-slate-500">
          Full offline fallback data store synchronized with browser LocalStorage.
        </p>
      </footer>
    </div>
  );
}
