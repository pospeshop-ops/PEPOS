/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import { 
  Warehouse, 
  Trash2, 
  Edit, 
  Plus, 
  X, 
  Check, 
  Tag, 
  AlertTriangle,
  FolderPlus,
  Boxes
} from "lucide-react";
import { Product } from "../types";

interface InventoryViewProps {
  products: Product[];
  categories: string[];
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddCategory: (categoryName: string) => void;
  onRemoveCategory: (categoryName: string) => void;
}

export function InventoryView({
  products,
  categories,
  onUpdateProduct,
  onDeleteProduct,
  onAddCategory,
  onRemoveCategory,
}: InventoryViewProps) {
  // Inventory view sub-tabs
  const [invSubTab, setInvSubTab] = useState<"items" | "categories">("items");
  
  // Category input state
  const [newCatInput, setNewCatInput] = useState("");
  
  // Edit product state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const formatLKR = (amount: number) => {
    return new Intl.NumberFormat("si-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleEditClick = (p: Product) => {
    setEditingProduct({ ...p });
  };

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    if (!editingProduct.name.trim()) {
      alert("Product name cannot be empty.");
      return;
    }
    if (editingProduct.cost < 0 || editingProduct.salePrice < 0 || editingProduct.stock < 0) {
      alert("Numbers must be positive values.");
      return;
    }
    if (editingProduct.salePrice < editingProduct.cost) {
      if (!confirm("Warning: Sale price is less than cost price. Save anyway?")) {
        return;
      }
    }
    
    onUpdateProduct(editingProduct);
    setEditingProduct(null);
  };

  const handleDeleteClick = (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      onDeleteProduct(id);
    }
  };

  const handleAddCategorySubmit = (e: FormEvent) => {
    e.preventDefault();
    const name = newCatInput.trim();
    if (!name) return;
    if (categories.includes(name)) {
      alert("Category name already exists.");
      return;
    }
    onAddCategory(name);
    setNewCatInput("");
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-teal-600" />
            Inventory & Catalog Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Control product prices, current stock levels, and store categories</p>
        </div>

        {/* View toggles */}
        <div className="flex bg-slate-100 rounded-xl p-1 text-xs font-semibold gap-1">
          <button
            id="subtab-items-btn"
            onClick={() => setInvSubTab("items")}
            className={`px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              invSubTab === "items"
                ? "bg-white text-slate-800 shadow"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            Stock Inventory
          </button>
          <button
            id="subtab-cats-btn"
            onClick={() => setInvSubTab("categories")}
            className={`px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              invSubTab === "categories"
                ? "bg-white text-slate-800 shadow"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            Store Categories
          </button>
        </div>
      </div>

      {invSubTab === "items" ? (
        <div className="border border-slate-150 rounded-xl overflow-hidden shadow-sm bg-slate-50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-500 uppercase text-[10px] tracking-wider font-semibold">
                <tr className="border-b border-slate-200">
                  <th className="py-3.5 px-4">Item Specifications</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-right">Cost (LKR)</th>
                  <th className="py-3.5 px-4 text-right">Sale Price (LKR)</th>
                  <th className="py-3.5 px-4 text-center">In Stock</th>
                  <th className="py-3.5 px-4 text-center">Markup</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 bg-white">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No products available yet. Click "Add New Product" to create one.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const isOutOfStock = p.stock <= 0;
                    const isLowStock = p.stock > 0 && p.stock <= 8;
                    const profitMargin = p.salePrice - p.cost;
                    const markupPercent = p.cost > 0 ? ((profitMargin / p.cost) * 100).toFixed(0) : "0";

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 px-4 font-bold text-slate-800">
                          <div>{p.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {p.id}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-medium">
                          {p.category}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-slate-600">
                          {formatLKR(p.cost)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          {formatLKR(p.salePrice)}
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          {isOutOfStock ? (
                            <span className="inline-flex bg-rose-50 text-rose-700 px-2 py-1 rounded-md text-[10px] uppercase tracking-wide border border-rose-100">
                              SOLD OUT
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-md text-[10px] uppercase tracking-wide border border-amber-200">
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-500" />
                              Low: {p.stock}
                            </span>
                          ) : (
                            <span className="inline-flex bg-teal-50 text-teal-700 px-2.5 py-1 rounded-md text-[10px] border border-teal-100">
                              {p.stock} units
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-[10px] text-teal-600">
                          +{markupPercent}%
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              id={`edit-item-${p.id}`}
                              onClick={() => handleEditClick(p)}
                              className="p-1 px-2.5 bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer"
                            >
                              <Edit className="w-3 h-3" />
                              Edit
                            </button>
                            <button
                              id={`delete-item-${p.id}`}
                              onClick={() => handleDeleteClick(p.id, p.name)}
                              className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Categories Setup Tab */
        <div className="space-y-6 max-w-xl">
          <form onSubmit={handleAddCategorySubmit} className="flex gap-2">
            <input
              id="new-category-input"
              type="text"
              value={newCatInput}
              onChange={(e) => setNewCatInput(e.target.value)}
              placeholder="Add new Category Name (e.g. Inks, Cables, Chargers)..."
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
            />
            <button
              id="add-category-btn"
              type="submit"
              className="px-5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold transition flex items-center gap-1.5 py-2.5 cursor-pointer shadow-sm shadow-teal-700/10"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </form>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <h3 className="font-semibold text-slate-800 text-sm mb-3.5 flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-teal-600" />
              Store Categories list
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {categories.map((cat) => {
                const associatedProductCount = products.filter((p) => p.category === cat).length;
                return (
                  <div
                    key={cat}
                    className="inline-flex items-center gap-2.5 bg-white border border-slate-200/80 rounded-xl py-2 px-3.5 shadow-sm text-xs text-slate-700 hover:border-slate-300 transition"
                  >
                    <span className="font-semibold">{cat}</span>
                    <span className="bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded-lg text-[10px]">
                      {associatedProductCount} items
                    </span>
                    <button
                      id={`delete-category-${cat}`}
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete category "${cat}"?\nAssociated products' category values will be modified.`)) {
                          onRemoveCategory(cat);
                        }
                      }}
                      className="text-slate-350 hover:text-rose-600 p-0.5 rounded hover:bg-rose-50 transition cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Embedded edit product modal */}
      {editingProduct && (
        <div id="edit-modal-wrapper" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleEditSubmit}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden"
          >
            <div className="bg-teal-700 text-white px-6 py-4 flex justify-between items-center">
              <span className="font-display font-bold text-lg">Edit Catalog Item</span>
              <button 
                id="close-edit-modal-btn"
                type="button"
                onClick={() => setEditingProduct(null)} 
                className="text-teal-100 hover:text-white rounded-lg p-1 hover:bg-teal-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Product Name
                </label>
                <input
                  id="edit-product-name"
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none transition"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Cost Price (LKR)
                  </label>
                  <input
                    id="edit-product-cost"
                    type="number"
                    min="0"
                    step="any"
                    value={editingProduct.cost}
                    onChange={(e) => setEditingProduct({ ...editingProduct, cost: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none transition font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Sale Price (LKR)
                  </label>
                  <input
                    id="edit-product-price"
                    type="number"
                    min="0"
                    step="any"
                    value={editingProduct.salePrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, salePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none transition font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Stock Quantity
                  </label>
                  <input
                    id="edit-product-stock"
                    type="number"
                    min="0"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    id="edit-product-category"
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none transition cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex gap-3 justify-end">
              <button
                id="cancel-edit-btn"
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                id="save-edit-btn"
                type="submit"
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition flex items-center gap-1 shadow-sm"
              >
                <Check className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
