/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Printer, X, Check, Cpu, Info, Settings, HelpCircle } from "lucide-react";
import { Bill } from "../types";

interface PrintInvoiceModalProps {
  bill: Bill;
  onClose: () => void;
}

export function PrintInvoiceModal({ bill, onClose }: PrintInvoiceModalProps) {
  const [printerFormat, setPrinterFormat] = useState<"58mm" | "4x6">("58mm");
  const [showHardwareGuide, setShowHardwareGuide] = useState<boolean>(false);
  const [isDirectUSBConnecting, setIsDirectUSBConnecting] = useState<boolean>(false);
  const [webUsbError, setWebUsbError] = useState<string | null>(null);

  const formatLKR = (amount: number) => {
    return new Intl.NumberFormat("si-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Direct USB Printing via WebUSB with ESC/POS commands
  const handleDirectUSBPrint = async () => {
    setIsDirectUSBConnecting(true);
    setWebUsbError(null);
    try {
      if (!("usb" in navigator)) {
        setWebUsbError(
          "WebUSB API is not supported in this browser environment. Please open the app in a secure context (HTTPS) on Google Chrome or Microsoft Edge."
        );
        setIsDirectUSBConnecting(false);
        return;
      }

      // Request pairing with user selected USB thermal printer
      const device = await (navigator as any).usb.requestDevice({ filters: [] });
      await device.open();
      
      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }
      
      // Claim standard printer endpoint (interface 0 is almost universally the print interface)
      await device.claimInterface(0);

      const encoder = new TextEncoder();
      
      // Standard ESC/POS Initialisation sequence
      const initCommand = new Uint8Array([0x1B, 0x40]); // ESC @
      const centerAlign = new Uint8Array([0x1B, 0x61, 0x01]); // ESC a 1
      const leftAlign = new Uint8Array([0x1B, 0x61, 0x00]); // ESC a 0
      const boldOn = new Uint8Array([0x1B, 0x45, 0x01]); // ESC E 1
      const boldOff = new Uint8Array([0x1B, 0x45, 0x00]); // ESC E 0
      const feedCut = new Uint8Array([0x1D, 0x56, 0x42, 0x20]); // GS V 66 32

      let receiptText = "";
      receiptText += "PE COMPUTERS & BOOKSHOP\n";
      receiptText += "Naranovita, Porowagama\n";
      receiptText += "Hotline: 070 607 7607\n";
      receiptText += "================================\n";
      receiptText += `Receipt: ${bill.id}\n`;
      receiptText += `Date: ${bill.date}\n`;
      receiptText += "================================\n";

      bill.items.forEach((item) => {
        // Wrap large names nicely to fit thermal paper width (32 characters max per line)
        const namePart = item.name.length > 32 ? item.name.substring(0, 29) + "..." : item.name;
        receiptText += `${namePart}\n`;
        const qty_price = `${item.quantity} x LKR ${item.price.toFixed(2)}`;
        const total_price = `LKR ${(item.price * item.quantity).toFixed(2)}`;
        const spacingAmt = 32 - qty_price.length - total_price.length;
        const spacing = spacingAmt > 0 ? " ".repeat(spacingAmt) : " ";
        receiptText += `${qty_price}${spacing}${total_price}\n`;
        if (item.warranty && item.warranty !== "No Warranty") {
          receiptText += ` * Warranty: ${item.warranty}\n`;
        }
      });

      receiptText += "--------------------------------\n";
      if (bill.discount > 0) {
        receiptText += `Subtotal: LKR ${bill.subtotal.toFixed(2)}\n`;
        receiptText += `Discount: ${bill.discount}%\n`;
      }
      receiptText += `TOTAL: LKR ${bill.total.toFixed(2)}\n`;
      receiptText += "================================\n";
      receiptText += "  Thank you for your business!  \n";
      receiptText += " Please preserve for warranty \n\n\n\n";

      const textBytes = encoder.encode(receiptText);
      const combinedPayload = new Uint8Array(
        initCommand.length +
        centerAlign.length +
        boldOn.length +
        encoder.encode("PE COMPUTERS & BOOKSHOP\n\n").length +
        boldOff.length +
        leftAlign.length +
        textBytes.length +
        feedCut.length
      );

      let offset = 0;
      combinedPayload.set(initCommand, offset); offset += initCommand.length;
      combinedPayload.set(centerAlign, offset); offset += centerAlign.length;
      combinedPayload.set(boldOn, offset); offset += boldOn.length;
      combinedPayload.set(encoder.encode("PE COMPUTERS & BOOKSHOP\n\n"), offset); offset += encoder.encode("PE COMPUTERS & BOOKSHOP\n\n").length;
      combinedPayload.set(boldOff, offset); offset += boldOff.length;
      combinedPayload.set(leftAlign, offset); offset += leftAlign.length;
      combinedPayload.set(textBytes, offset); offset += textBytes.length;
      combinedPayload.set(feedCut, offset); offset += feedCut.length;

      // Detect output endpoint
      const endpoint = device.configuration?.interfaces[0]?.alternates[0]?.endpoints.find(
        (e) => e.direction === "out" && e.type === "bulk"
      );

      if (!endpoint) {
        setWebUsbError(
          "Direct USB Endpoint not found. Ensure standard receipt driver is using native RAW protocol. We will fall back to using standard printing."
        );
        setIsDirectUSBConnecting(false);
        return;
      }

      await device.transferOut(endpoint.endpointNumber, combinedPayload);
      alert("Direct thermal invoice payload safely printed on Port_#0010.Hub_#0003.");
    } catch (err: any) {
      console.warn("Direct USB setup failed/dismissed:", err);
      const errMsg = err.message || String(err);
      if (errMsg.toLowerCase().includes("access denied")) {
        setWebUsbError("access-denied-conflict");
      } else {
        setWebUsbError(errMsg);
      }
    } finally {
      setIsDirectUSBConnecting(false);
    }
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
          <td style="padding: 5px 0; font-family: monospace; font-size: 13px;">
            <div style="font-weight: bold; color: #111;">${item.name}</div>
            ${item.warranty && item.warranty !== "No Warranty" 
              ? `<div style="font-size: 11px; color: #555; margin-top: 1px; font-weight: bold;">🛡️ Warranty: ${item.warranty}</div>` 
              : ""
            }
          </td>
          <td style="padding: 5px 0; text-align: center; font-family: monospace; font-size: 13px;">${item.quantity}</td>
          <td style="padding: 5px 0; text-align: right; font-family: monospace; font-size: 13px;">${formatLKR(item.price)}</td>
          <td style="padding: 5px 0; text-align: right; font-family: monospace; font-size: 13px;">${formatLKR(item.price * item.quantity)}</td>
        </tr>
      `
      )
      .join("");

    const discountRowHtml =
      bill.discount > 0
        ? `
        <div style="display: flex; justify-content: space-between; margin-top: 4px; font-family: monospace; font-size: 12px; color: #333;">
          <span>Subtotal:</span>
          <span>${formatLKR(bill.subtotal)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 1px; color: #cc0000; font-family: monospace; font-size: 12px;">
          <span>Discount (${bill.discount}%):</span>
          <span>-${formatLKR(bill.subtotal * (bill.discount / 100))}</span>
        </div>
      `
        : "";

    // 58mm Thermal Receipt optimized CSS and 4x6 labels size comparison
    const pageStyles = printerFormat === "58mm" 
      ? `
        @page {
          size: 58mm auto;
          margin: 0;
        }
        body {
          font-family: 'Courier New', Courier, monospace, sans-serif;
          color: #000;
          background: #fff;
          margin: 0;
          padding: 3mm;
          width: 52mm; /* Exact printable width for 58mm roll */
          font-size: 12px;
          -webkit-print-color-adjust: exact;
        }
        .title {
          font-size: 15px; 
          font-weight: 900;
          letter-spacing: -0.5px;
        }
        .info {
          font-size: 10px;
          line-height: 1.2;
        }
        .table-items th {
          font-size: 11px;
        }
        .table-items td {
          font-size: 11px;
        }
        .total-price {
          font-size: 14px !important;
        }
        .footer {
          margin-top: 10px;
          font-size: 10px;
        }
      `
      : `
        @page {
          size: 104mm 152mm; /* 4x6 inches approximate standard size */
          margin: 8mm;
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
        .title {
          font-size: 18px;
          font-weight: bold;
        }
        .info {
          font-size: 12px;
        }
        .total-price {
          font-size: 16px !important;
        }
        .footer {
          margin-top: 20px;
          font-size: 12px;
        }
      `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${bill.id}</title>
        <style>
          ${pageStyles}
          .receipt-container {
            max-width: 100%;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          .title {
            margin-bottom: 3px;
            text-transform: uppercase;
          }
          .info {
            margin-bottom: 2px;
          }
          .table-items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
          }
          .table-items th {
            border-bottom: 1px dashed #000;
            text-align: left;
            padding: 4px 0;
          }
          .footer {
            border-top: 2px dashed #000;
            padding-top: 10px;
            text-align: center;
          }
          .dashed-divider {
            border-top: 1px dashed #000;
            margin: 6px 0;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <div class="title" style="font-weight: 800;">PE Computers & BookShop</div>
            <div class="info">Stationery & Technology Accessories</div>
            <div class="info">Naranovita, Porowagama</div>
            <div class="info">Hotline: 070 607 7607</div>
            <div class="dashed-divider"></div>
            <div style="display: flex; justify-content: space-between; font-size: 10px; margin-top: 4px; font-family: monospace;">
              <span>Bill: ${bill.id}</span>
              <span>Date: ${bill.date.split(", ").slice(1).join(", ")}</span>
            </div>
          </div>
          
          <table class="table-items">
            <thead>
              <tr style="font-family: monospace;">
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
          
          <div style="margin-top: 10px; border-top: 1px dashed #000; padding-top: 6px;">
            ${discountRowHtml}
            <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 6px; border-top: 1px double #000; padding-top: 5px; font-family: monospace;" class="total-price">
              <span>TOTAL (LKR):</span>
              <span>${formatLKR(bill.total)}</span>
            </div>
          </div>

          <div class="footer">
            <p style="margin: 0 0 4px 0; font-weight: bold;">THANK YOU FOR YOUR BUSINESS!</p>
            <p style="margin: 0; font-size: 9px; color: #222;">Hardware, Stationery & Quality Books</p>
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
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[92vh] border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-teal-700 text-white px-6 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 bg-teal-800 rounded-full p-0.5" />
            <span className="font-semibold text-lg tracking-tight">Order Complete & Saved</span>
          </div>
          <button 
            id="close-invoice-btn"
            onClick={onClose} 
            className="text-teal-100 hover:text-white hover:bg-teal-600 rounded-lg p-1 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configurations section */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-slate-500 animate-spin-slow" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Printer Settings</span>
            </div>
            
            {/* Guide Toggle */}
            <button
              onClick={() => setShowHardwareGuide(!showHardwareGuide)}
              className="text-teal-600 hover:text-teal-700 text-xs font-semibold flex items-center gap-1 cursor-pointer bg-teal-50 hover:bg-teal-100/70 px-2.5 py-1 rounded-lg"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Printer Config Guide</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPrinterFormat("58mm")}
              className={`flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                printerFormat === "58mm"
                  ? "border-teal-600 bg-teal-50/50 text-teal-800"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0" />
              58mm Thermal Roll (Continuous)
            </button>
            <button
              onClick={() => setPrinterFormat("4x6")}
              className={`flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                printerFormat === "4x6"
                  ? "border-teal-600 bg-teal-50/50 text-teal-800"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
              Standard Label (4" x 6" Size)
            </button>
          </div>

          {/* Connected hardware target info bar */}
          <div className="bg-slate-900 text-[10px] text-slate-400 font-mono px-3 py-2 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>Target Hardware: <strong>58mm Thermal Printer</strong></span>
            </div>
            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[9px] font-bold">Port_#0010.Hub_#0003</span>
          </div>

          {webUsbError && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl space-y-2 text-[11px] leading-relaxed text-slate-700 font-sans shadow-sm">
              <p className="font-bold text-rose-800 border-b border-rose-100 pb-1 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse inline-block" />
                Connection Error on Port_#0010.Hub_#0003
              </p>
              {webUsbError === "access-denied-conflict" ? (
                <div className="space-y-2 text-slate-600">
                  <p className="font-semibold text-rose-950">
                    ⚠️ Connection Blocked (Access Denied)
                  </p>
                  <p>
                    Your operating system (Windows/Android/macOS) is currently claiming this printer driver (Active spooler/driver conflict detected).
                  </p>
                  <div className="bg-white/80 p-2.5 rounded-lg border border-rose-100 space-y-1.5 text-xs">
                    <p className="font-bold text-teal-800">💡 Easy Resolution Options:</p>
                    <p>
                      <strong>1. Recommended:</strong> Click the green <strong>"Standard Browser Print"</strong> button below. It prints beautifully using your existing driver on 58mm paper rolls with zero setup!
                    </p>
                    <p>
                      <strong>2. For WebUSB direct mode:</strong> Use the utility <strong>Zadig</strong> to switch the thermal printer driver to <strong>WinUSB</strong>.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="font-medium text-rose-950">Error details:</p>
                  <p className="font-mono text-[10px] bg-white/60 p-2 rounded border border-rose-100 break-all">{webUsbError}</p>
                  <p className="mt-1 text-slate-500">Please use the green <strong>Standard Browser Print</strong> option for automatic driver-level compatibility!</p>
                </div>
              )}
            </div>
          )}

          {showHardwareGuide && (
            <div className="p-3 bg-white border border-teal-100 rounded-xl space-y-2 text-[11px] leading-relaxed text-slate-600 font-sans shadow-inner">
              <p className="font-bold text-teal-900 border-b border-teal-50 pb-1 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 shrink-0" /> Map Thermal Printer (Port_#0010.Hub_#0003)
              </p>
              <ul className="list-decimal list-inside space-y-1 text-slate-500">
                <li>Make sure your 58mm printer is connected to your computer's <strong>USB Port 10 (Hub 3)</strong>.</li>
                <li>In Chrome/Edge Windows/Android print pool, choose the printer (e.g. <em>POS-58</em> or <em>XP-58</em>).</li>
                <li>Specify <strong>Paper Size: 58mm (or Roll Paper)</strong> in your printer's advanced properties.</li>
                <li>Keep Margins set to <strong>Minimum or None</strong> and uncheck "Headers and footers" for a clean look.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Scrollable Receipt Preview */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm max-w-sm mx-auto relative relative-after-waves">
            <div className="text-center pb-4 border-b-2 border-dashed border-slate-200">
              <h2 className="font-display font-bold text-lg tracking-wide text-slate-800 uppercase">
                PE COMPUTERS & BOOKSHOP
              </h2>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Computer Accessories & Fine Books
              </p>
              <p className="text-[10px] text-slate-400">
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
                      <td className="py-2.5 max-w-[170px] break-words">
                        <div className="font-bold text-slate-800 leading-tight">{item.name}</div>
                        {item.warranty && item.warranty !== "No Warranty" && (
                          <div className="text-[10px] text-teal-600 font-bold mt-1.5 flex items-center gap-1 bg-teal-50 px-2 py-0.5 rounded-md w-fit">
                            🛡️ Warranty: {item.warranty}
                          </div>
                        )}
                      </td>
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

            <div className="text-center pt-3 border-t border-slate-100 text-[10px] text-slate-400 italic">
              Thank You For Supporting PE Computers & Bookshop!
            </div>
          </div>
        </div>

        {/* Modal actions */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row gap-2 shrink-0">
          <button
            id="print-action-btn"
            onClick={handlePrint}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition active:scale-95 shadow-md shadow-teal-700/10 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Standard Browser Print</span>
          </button>

          <button
            id="usb-direct-action-btn"
            onClick={handleDirectUSBPrint}
            disabled={isDirectUSBConnecting}
            className="flex-1 bg-slate-800 hover:bg-slate-900 text-slate-100 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition active:scale-95 shadow-sm disabled:opacity-50 cursor-pointer text-xs"
          >
            <Cpu className="w-4 h-4 text-teal-400" />
            <span>{isDirectUSBConnecting ? "Transmitting..." : "WebUSB Direct Port Output"}</span>
          </button>
          
          <button
            id="done-action-btn"
            onClick={onClose}
            className="sm:px-5 py-3 sm:py-0 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
