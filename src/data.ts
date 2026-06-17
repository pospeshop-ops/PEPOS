/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from "./types";

export const INITIAL_CATEGORIES: string[] = [
  "Laptop & PC Gear",
  "Writing & Pens",
  "Books & CRs",
  "Paper Supplies",
  "Art & Craft"
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "A4 Double A Paper Ream (80gsm, 500 Sheets)",
    cost: 1100,
    salePrice: 1450,
    stock: 45,
    category: "Paper Supplies"
  },
  {
    id: "prod-2",
    name: "Atlas Single Rule CR Book (120 Pages)",
    cost: 180,
    salePrice: 260,
    stock: 120,
    category: "Books & CRs"
  },
  {
    id: "prod-3",
    name: "Pilot G2 Gel Pen - Blue (0.7mm)",
    cost: 220,
    salePrice: 320,
    stock: 80,
    category: "Writing & Pens"
  },
  {
    id: "prod-4",
    name: "Atlas Chooty Ballpoint Pen - Blue",
    cost: 15,
    salePrice: 30,
    stock: 350,
    category: "Writing & Pens"
  },
  {
    id: "prod-5",
    name: "Logitech Wireless USB Optical Mouse",
    cost: 950,
    salePrice: 1550,
    stock: 18,
    category: "Laptop & PC Gear"
  },
  {
    id: "prod-6",
    name: "Kingston 64GB USB 3.0 Flash Drive",
    cost: 1400,
    salePrice: 2100,
    stock: 14,
    category: "Laptop & PC Gear"
  },
  {
    id: "prod-7",
    name: "Stapler Max No. 10",
    cost: 320,
    salePrice: 480,
    stock: 25,
    category: "Paper Supplies"
  },
  {
    id: "prod-8",
    name: "Velvet Matte Pencils (Pack of 12)",
    cost: 180,
    salePrice: 280,
    stock: 50,
    category: "Writing & Pens"
  },
  {
    id: "prod-9",
    name: "Pentel Watercolor Set (12 Colors)",
    cost: 550,
    salePrice: 850,
    stock: 18,
    category: "Art & Craft"
  },
  {
    id: "prod-10",
    name: "Atlas Glue Stick (21g Office size)",
    cost: 90,
    salePrice: 160,
    stock: 95,
    category: "Paper Supplies"
  },
  {
    id: "prod-11",
    name: "HDMI Male to Male Cable (1.5m)",
    cost: 280,
    salePrice: 450,
    stock: 30,
    category: "Laptop & PC Gear"
  }
];

export const INITIAL_BILLS = [
  {
    id: "BILL-1001",
    date: "Wednesday, June 10, 2026, 04:15 PM",
    dateKey: "2026-06-10",
    items: [
      { name: "A4 Double A Paper Ream (80gsm, 500 Sheets)", quantity: 2, price: 1450, cost: 2200 },
      { name: "Atlas Chooty Ballpoint Pen - Blue", quantity: 10, price: 30, cost: 150 }
    ],
    discount: 5,
    subtotal: 3200,
    total: 3040,
    cost: 2350,
    profit: 690
  },
  {
    id: "BILL-1002",
    date: "Thursday, June 11, 2026, 11:30 AM",
    dateKey: "2026-06-11",
    items: [
      { name: "Logitech Wireless USB Optical Mouse", quantity: 1, price: 1550, cost: 950 },
      { name: "Kingston 64GB USB 3.0 Flash Drive", quantity: 1, price: 2100, cost: 1400 },
      { name: "Atlas Single Rule CR Book (120 Pages)", quantity: 3, price: 260, cost: 540 }
    ],
    discount: 0,
    subtotal: 4430,
    total: 4430,
    cost: 2890,
    profit: 1540
  },
  {
    id: "BILL-1003",
    date: "Friday, June 12, 2026, 02:45 PM",
    dateKey: "2026-06-12",
    items: [
      { name: "Pilot G2 Gel Pen - Blue (0.7mm)", quantity: 5, price: 320, cost: 1100 },
      { name: "Velvet Matte Pencils (Pack of 12)", quantity: 1, price: 280, cost: 180 }
    ],
    discount: 10,
    subtotal: 1880,
    total: 1692,
    cost: 1280,
    profit: 412
  },
  {
    id: "BILL-1004",
    date: "Sunday, June 14, 2026, 10:05 AM",
    dateKey: "2026-06-14",
    items: [
      { name: "A4 Double A Paper Ream (80gsm, 500 Sheets)", quantity: 1, price: 1450, cost: 1100 },
      { name: "Stapler Max No. 10", quantity: 1, price: 480, cost: 320 },
      { name: "Atlas Glue Stick (21g Office size)", quantity: 2, price: 160, cost: 180 }
    ],
    discount: 0,
    subtotal: 2250,
    total: 2250,
    cost: 1600,
    profit: 650
  },
  {
    id: "BILL-1005",
    date: "Monday, June 15, 2026, 05:20 PM",
    dateKey: "2026-06-15",
    items: [
      { name: "Kingston 64GB USB 3.0 Flash Drive", quantity: 2, price: 2100, cost: 2800 },
      { name: "Logitech Wireless USB Optical Mouse", quantity: 1, price: 1550, cost: 950 }
    ],
    discount: 8,
    subtotal: 5750,
    total: 5290,
    cost: 3750,
    profit: 1540
  }
];
