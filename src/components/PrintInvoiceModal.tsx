/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Printer, X, Check } from "lucide-react";
import { Bill } from "../types";

interface PrintInvoiceModalProps {
  bill: Bill;
  onClose: () => void;
}

export function PrintInvoiceModal({ bill, onClose }: PrintInvoiceModalProps) {
  const formatLKR = (amount: number) => {
    return new Intl.NumberFormat("si-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handlePrint = () => {
    // Open a clean secondary printable window
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup blocker active! Please allow popups to print invoices.");
      return;
    }

    const itemsRowsHtml = bill.items
      .map(
        (item) => `
        <tr style="border-bottom: 1px dotted #ddd;">
          <td style="padding: 6px 0; font-family: monospace; font-size: 13px;">${item.name}</td>
          <td style="padding: 6px 0; text-align: center; font-family: monospace; font-size: 13px;">${item.quantity}</td>
          <td style="padding: 6px 0; text-align: right; font-family: monospace; font-size: 13px;">${formatLKR(item.price)}</td>
          <td style="padding: 6px 0; text-align: right; font-family: monospace; font-size: 13px;">${formatLKR(item.price * item.quantity)}</td>
        </tr>
      `
      )
      .join("");

    const discountRowHtml =
      bill.discount > 0
        ? `
        <div style="display: flex; justify-content: space-between; margin-top: 6px; font-family: monospace; font-size: 13px;">
          <span>Subtotal:</span>
          <span>${formatLKR(bill.subtotal)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 2px; color: #cc0000; font-family: monospace; font-size: 13px;">
          <span>Discount (${bill.discount}%):</span>
          <span>-${formatLKR(bill.subtotal * (bill.discount / 100))}</span>
        </div>
      `
        : "";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${bill.id}</title>
        <style>
          @page {
            size: 104mm 152mm; /* 4x6 inches approximate standard size */
            margin: 10mm;
          }
          body {
            font-family: 'Courier New', Courier, monospace, sans-serif;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 0;
            width: 100%;
            -webkit-print-color-adjust: exact;
          }
          .receipt-container {
            max-width: 100%;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            border-bottom: 2px dashed #000;
            padding-bottom: 15px;
            margin-bottom: 15px;
          }
          .title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 4px;
            text-transform: uppercase;
          }
          .info {
            font-size: 12px;
            margin-bottom: 2px;
          }
          .table-items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          .table-items th {
            border-bottom: 1px dashed #000;
            font-size: 12px;
            text-align: left;
            padding: 4px 0;
          }
          .footer {
            border-top: 2px dashed #000;
            padding-top: 15px;
            text-align: center;
            font-size: 12px;
            margin-top: 20px;
          }
          .dashed-divider {
            border-top: 1px dashed #000;
            margin: 8px 0;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <div class="title">PE Computers & BookShop</div>
            <div class="info">Stationery & Technology Accessories</div>
            <div class="info">Naranovita, Porowagama</div>
            <div class="info">Hotline: 070 607 7607</div>
            <div class="dashed-divider"></div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 5px;">
              <span>Bill: ${bill.id}</span>
              <span>Date: ${bill.date.split(", ").slice(1).join(", ")}</span>
            </div>
          </div>
          
          <table class="table-items">
            <thead>
              <tr style="font-family: monospace; font-size: 12px;">
                <th style="width: 45%; text-align: left;">Item</th>
                <th style="width: 10%; text-align: center;">Qty</th>
                <th style="width: 20%; text-align: right;">Price</th>
                <th style="width: 25%; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRowsHtml}
            </tbody>
          </table>

          <div style="margin-top: 15px;">
            ${discountRowHtml}
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; margin-top: 8px; border-top: 1px double #000; padding-top: 6px;">
              <span>TOTAL (LKR):</span>
              <span>${formatLKR(bill.total)}</span>
            </div>
          </div>

          <div class="footer">
            <p style="margin: 0 0 5px 0; font-weight: bold;">THANK YOU FOR YOUR BUSINESS!</p>
            <p style="margin: 0; font-size: 10px;">Hardware, Stationary & Quality Books</p>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div id="invoice-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-teal-700 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 bg-teal-800 rounded-full p-0.5" />
            <span className="font-semibold text-lg tracking-tight">Order Saved & Completed</span>
          </div>
          <button 
            id="close-invoice-btn"
            onClick={onClose} 
            className="text-teal-100 hover:text-white hover:bg-teal-600 rounded-lg p-1 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Preview */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm max-w-sm mx-auto relative relative-after-waves">
            {/* Ribbon Cut visual effect */}
            <div className="text-center pb-4 border-b-2 border-dashed border-slate-200">
              <h2 className="font-display font-bold text-xl tracking-wide text-slate-800">
                PE COMPUTERS & BOOKSHOP
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Computer Accessories & Fine Books
              </p>
              <p className="text-[11px] text-slate-400">
                Porowagama Sri Lanka | 0706077607
              </p>
              
              <div className="flex justify-between items-center text-[10px] text-slate-400 mt-4 leading-none font-mono">
                <span>Receipt: {bill.id}</span>
                <span>Date: {bill.date.split(", ").slice(2).join(", ")}</span>
              </div>
            </div>

            <div className="py-4">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-mono">
                    <th className="pb-2 font-medium">Item Name</th>
                    <th className="pb-2 text-center font-medium">Qty</th>
                    <th className="pb-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                  {bill.items.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="py-2.5 max-w-[180px] break-words">{item.name}</td>
                      <td className="py-2.5 text-center">{item.quantity}</td>
                      <td className="py-2.5 text-right font-semibold">{formatLKR(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-dashed border-slate-200 mt-4 pt-3 space-y-1.5 text-xs font-mono text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatLKR(bill.subtotal)}</span>
                </div>
                {bill.discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount ({bill.discount}%):</span>
                    <span>-{formatLKR(bill.subtotal * (bill.discount / 100))}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-2 font-display">
                  <span>TOTAL:</span>
                  <span>{formatLKR(bill.total)}</span>
                </div>
              </div>
            </div>

            <div className="text-center pt-3 border-t border-slate-100 text-[11px] text-slate-400 italic">
              Thank You For Supporting PE Computers & Bookshop!
            </div>
          </div>
        </div>

        {/* Modal actions */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex gap-3">
          <button
            id="print-action-btn"
            onClick={handlePrint}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition active:scale-95 shadow-md shadow-teal-700/10"
          >
            <Printer className="w-4 h-4" />
            Print Receipt (4x6)
          </button>
          <button
            id="done-action-btn"
            onClick={onClose}
            className="px-5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
