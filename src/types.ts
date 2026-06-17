/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  cost: number;
  salePrice: number;
  stock: number;
  category: string;
}

export interface CartItem {
  id: string; // Product id or custom id for quick sale
  name: string;
  price: number;
  cost: number;
  quantity: number;
  warranty?: string;
}

export interface BillItem {
  name: string;
  quantity: number;
  price: number;
  cost: number;
  warranty?: string;
}

export interface Bill {
  id: string;
  date: string; // Presentable date string
  dateKey: string; // YYYY-MM-DD
  items: BillItem[];
  discount: number; // Percent
  subtotal: number;
  total: number;
  cost: number;
  profit: number;
}
