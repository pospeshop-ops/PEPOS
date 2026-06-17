/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Printer, X, Check, Usb, Sliders, RefreshCw, Smartphone } from "lucide-react";
import { Bill } from "../types";

interface PrintInvoiceModalProps {
  bill: Bill;
  onClose: () => void;
}

export function PrintInvoiceModal({ bill, onClose }: PrintInvoiceModalProps) {
  const [usbDevice, setUsbDevice] = useState<any>(null);
  const [isPrintingUsb, setIsPrintingUsb] = useState(false);
  const [pairedDeviceList, setPairedDeviceList] = useState<any[]>([]);
  const [printFormat, setPrintFormat] = useState<"standard" | "58mm-css">("58mm-css");

  useEffect(() => {
    // If WebUSB is supported, check if there are any pre-paired devices
    const nav: any = typeof navigator !== "undefined" ? navigator : null;
    if (nav && nav.usb) {
      nav.usb.getDevices().then((devices: any[]) => {
        setPairedDeviceList(devices);
        if (devices.length > 0) {
          // Prioritize your configured VID 0483 & PID 5840 printer if present
          const targetPrinter = devices.find(d => d.vendorId === 0x0483 && d.productId === 0x5840);
          setUsbDevice(targetPrinter || devices[0]);
        }
      }).catch((err: any) => {
        console.warn("Could not retrieve USB devices list:", err);
      });
    }
  }, []);

  const formatLKR = (amount: number) => {
    return new Intl.NumberFormat("si-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Original Standard 4" x 6" Invoice Print
  const handlePrintStandard = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup blocker active! Please allow popups to print invoices.");
      return;
    }

    const itemsRowsHtml = bill.items
      .map(
        (item) => `
        <tr style="border-bottom: 1px dotted #ddd;">
          <td style="padding: 6px 0; font-family: monospace; font-size: 13px;">
            <div>${item.name}</div>
            ${item.warranty && item.warranty !== "No Warranty" 
              ? `<div style="font-size: 11px; color: #444; margin-top: 2px; font-weight: bold;">🛡️ Warranty: ${item.warranty}</div>` 
              : ""
            }
          </td>
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

  // 58mm Thermal Printer Optimized CSS Printer Layout (for system spoolers, works on PC/Android)
  const handlePrint58mmCSS = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup blocker active! Please allow popups to print invoices.");
      return;
    }

    const itemsRowsHtml = bill.items
      .map(
        (item) => `
        <tr style="border-bottom: 1px dashed #bbb;">
          <td style="padding: 4px 0; font-family: monospace; font-size: 12px; line-height: 1.3;">
            <div style="font-weight: bold;">${item.name}</div>
            <div style="font-size: 10px; color: #333; margin-top: 1px;">
              ${item.quantity} x ${formatLKR(item.price)}
            </div>
            ${item.warranty && item.warranty !== "No Warranty" 
              ? `<div style="font-size: 10px; font-weight: bold; margin-top: 1.5px; color:#111;">🛡️ Warr: ${item.warranty}</div>` 
              : ""
            }
          </td>
          <td style="padding: 4px 0; text-align: right; font-family: monospace; font-size: 12px; font-weight: bold; vertical-align: top;">
            ${formatLKR(item.price * item.quantity)}
          </td>
        </tr>
      `
      )
      .join("");

    const discountRowHtml =
      bill.discount > 0
        ? `
        <div style="display: flex; justify-content: space-between; margin-top: 5px; font-family: monospace; font-size: 11px;">
          <span>Subtotal:</span>
          <span>${formatLKR(bill.subtotal)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 1px; color: #000; font-family: monospace; font-size: 11px; font-weight: bold;">
          <span>Disc (${bill.discount}%):</span>
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
            size: 58mm auto;
            margin: 0;
          }
          body {
            font-family: 'Courier New', Courier, monospace, sans-serif;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 2mm 3.5mm;
            width: 51mm; /* Printable viewport margin safety for 58mm */
            font-size: 12px;
            box-sizing: border-box;
          }
          .title {
            font-size: 15px;
            font-weight: 900;
            text-align: center;
            margin-bottom: 2px;
            text-transform: uppercase;
            letter-spacing: -0.5px;
          }
          .sub-title {
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 4px;
            margin-top: -3px;
          }
          .center-text {
            text-align: center;
            font-size: 10px;
            margin-bottom: 1px;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 6px 0;
          }
          .double-divider {
            border-top: 2px double #000;
            margin: 6px 0;
          }
          .table-items {
            width: 100%;
            border-collapse: collapse;
          }
          .footer {
            text-align: center;
            font-size: 10px;
            margin-top: 12px;
            line-height: 1.4;
          }
        </style>
      </head>
      <body>
        <div class="title">PE COMPUTERS</div>
        <div class="sub-title">& BOOKSHOP</div>
        <div class="center-text">Porowagama, Sri Lanka</div>
        <div class="center-text">Tel: 070 607 7607</div>
        <div class="divider"></div>
        <div style="display: flex; justify-content: space-between; font-size: 10px; font-weight: bold;">
          <span>Invoice: ${bill.id}</span>
          <span>Date: ${bill.date.split(", ").slice(1, 3).join(", ")}</span>
        </div>
        <div class="divider"></div>
        
        <table class="table-items">
          <tbody>
            ${itemsRowsHtml}
          </tbody>
        </table>

        <div class="divider"></div>
        ${discountRowHtml}
        <div style="display: flex; justify-content: space-between; font-weight: 900; font-size: 13px; margin-top: 3px; padding-top: 2px;">
          <span>TOTAL LKR:</span>
          <span>${formatLKR(bill.total)}</span>
        </div>
        <div class="double-divider"></div>

        <div class="footer">
          <div style="font-weight: 900; font-size: 11px;">THANK YOU! COME AGAIN.</div>
          <div style="margin-top: 3px;">Quality Books & Computer Spares</div>
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

  // Direct USB ESC/POS Printer Printing utilizing WebUSB
  const handleRegisterAndPrintUSB = async () => {
    const nav: any = typeof navigator !== "undefined" ? navigator : null;
    if (!nav || !nav.usb) {
      alert("Your browser does not support WebUSB! Please use Google Chrome, MS Edge, or Opera on Windows/Mac/Android for direct USB hardware access.");
      return;
    }

    try {
      setIsPrintingUsb(true);
      let device = usbDevice;

      if (!device) {
        // Request visual pairing with exact VID/PID filters to highlight client's custom STM printer
        device = await nav.usb.requestDevice({
          filters: [
            { vendorId: 0x0483, productId: 0x5840 }, // Your printer's exact hardware ID
            { vendorId: 0x0483 },                   // STMicroelectronics devices
            { classCode: 7 }                        // Any USB printer Class
          ]
        });
        setUsbDevice(device);
        // Refresh registered device list
        const updatedDevices = await nav.usb.getDevices();
        setPairedDeviceList(updatedDevices);
      }

      await device.open();
      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }

      // Scan interfaces and endpoints for Bulk OUT (printer)
      let interfaceNumber = 0;
      let endpointNumber = 0;

      const configurations = device.configurations || [];
      for (const config of configurations) {
        for (const iface of config.interfaces) {
          for (const alternate of iface.alternates) {
            // Find appropriate bulk OUT endpoint
            const ep = alternate.endpoints.find(e => e.direction === "out" && e.type === "bulk");
            if (ep) {
              interfaceNumber = iface.interfaceNumber;
              endpointNumber = ep.endpointNumber;
              break;
            }
          }
          if (endpointNumber > 0) break;
        }
        if (endpointNumber > 0) break;
      }

      // Try fallback to search on active configuration if not found yet
      if (endpointNumber === 0 && device.configuration) {
        for (const iface of device.configuration.interfaces) {
          for (const alternate of iface.alternates) {
            const ep = alternate.endpoints.find(e => e.direction === "out");
            if (ep) {
              interfaceNumber = iface.interfaceNumber;
              endpointNumber = ep.endpointNumber;
              break;
            }
          }
          if (endpointNumber > 0) break;
        }
      }

      if (endpointNumber === 0) {
        throw new Error("Could not detect write outbound interface endpoint on current USB printer. Connect another device.");
      }

      await device.claimInterface(interfaceNumber);

      // Create raw byte commands for high-performance 58mm ticket printing
      const encoder = new TextEncoder();
      const chunks: Uint8Array[] = [];

      // Byte values
      const ESC = 0x1b;
      const GS = 0x1d;

      // ESC/POS sequences
      const init = new Uint8Array([ESC, 0x40]);
      const alignCenter = new Uint8Array([ESC, 0x61, 1]);
      const alignLeft = new Uint8Array([ESC, 0x61, 0]);
      const alignRight = new Uint8Array([ESC, 0x61, 2]);
      const boldOn = new Uint8Array([ESC, 0x45, 1]);
      const boldOff = new Uint8Array([ESC, 0x45, 0]);
      
      // Sizes
      const doubleHeightOn = new Uint8Array([GS, 0x21, 0x01]);
      const normalHeight = new Uint8Array([GS, 0x21, 0x00]);
      
      // Paper feed commands
      const lineFeed = new Uint8Array([10]);
      const feedPaperAndCut = new Uint8Array([ESC, 0x64, 6]); // Feed 6 lines
      const autocut = new Uint8Array([GS, 0x56, 66, 0]); // Cut

      chunks.push(init);
      
      // Center Title - bold and slightly elevated size
      chunks.push(alignCenter);
      chunks.push(boldOn);
      chunks.push(doubleHeightOn);
      chunks.push(encoder.encode("PE COMPUTERS\n"));
      chunks.push(encoder.encode("& BOOKSHOP\n"));
      chunks.push(doubleHeightOn);
      chunks.push(boldOff);
      chunks.push(normalHeight);
      chunks.push(encoder.encode("Porowagama, Sri Lanka\n"));
      chunks.push(encoder.encode("Tel: 070 607 7607\n"));
      chunks.push(encoder.encode("--------------------------------\n")); // Exactly 32 columns

      // Aligned Invoice Metadata
      chunks.push(alignLeft);
      // Clean display date
      const dateParts = bill.date.split(", ").slice(1, 4).join(", ");
      chunks.push(encoder.encode(`ID: ${bill.id}\n`));
      chunks.push(encoder.encode(`Date: ${dateParts}\n`));
      chunks.push(encoder.encode("--------------------------------\n"));

      // Print individual products
      bill.items.forEach((item) => {
        // Line 1: Bold Item Name
        chunks.push(boldOn);
        chunks.push(encoder.encode(`${item.name}\n`));
        chunks.push(boldOff);

        // Line 2: Quantities & subtotal pricing values
        // E.g. "   1 x Rs. 4,500.00   Rs. 4,500" formatted strictly within 32 chars
        const quantityAndRate = `  ${item.quantity} x Rs.${item.price.toFixed(0)}`;
        const totalAmountText = `Rs.${(item.price * item.quantity).toFixed(0)}`;
        
        const spacePadding = 32 - quantityAndRate.length - totalAmountText.length;
        const spacingString = spacePadding > 0 ? " ".repeat(spacePadding) : " ";
        
        chunks.push(encoder.encode(`${quantityAndRate}${spacingString}${totalAmountText}\n`));

        // Line 3: Warranty Details if any (underlined-like)
        if (item.warranty && item.warranty !== "No Warranty") {
          chunks.push(encoder.encode(`  [Warranty: ${item.warranty}]\n`));
        }
      });

      chunks.push(encoder.encode("--------------------------------\n"));

      // Print invoice totals (right aligned)
      chunks.push(alignRight);
      if (bill.discount > 0) {
        const sub = `Subtotal: Rs.${bill.subtotal.toFixed(2)}`;
        chunks.push(encoder.encode(`${sub}\n`));
        const disc = `Disc (${bill.discount}%): -Rs.${(bill.subtotal * (bill.discount / 100)).toFixed(2)}`;
        chunks.push(encoder.encode(`${disc}\n`));
      }

      chunks.push(boldOn);
      const grandText = `GRAND TOTAL: Rs.${bill.total.toFixed(0)}`;
      chunks.push(encoder.encode(`${grandText}\n`));
      chunks.push(boldOff);

      chunks.push(alignCenter);
      chunks.push(encoder.encode("--------------------------------\n"));
      chunks.push(boldOn);
      chunks.push(encoder.encode("THANK YOU! VISIT AGAIN.\n"));
      chunks.push(boldOff);
      chunks.push(encoder.encode("High Quality IT Spares & Books\n"));

      // Feed lines and trigger cutting
      chunks.push(feedPaperAndCut);
      chunks.push(autocut);

      // Assemble chunks into one flat binary array
      let totalLength = chunks.reduce((total, cur) => total + cur.length, 0);
      let payload = new Uint8Array(totalLength);
      let tracker = 0;
      chunks.forEach((chunk) => {
        payload.set(chunk, tracker);
        tracker += chunk.length;
      });

      // Fire payload to bulk EP
      await device.transferOut(endpointNumber, payload);
    } catch (err: any) {
      console.error("[WebUSB ESC POS Printing failed]", err);
      alert(`USB Hard-Print Failed: ${err.message || err}. Please ensure POS USB printer is connected, turned on, and you allowed permissions in browser prompt.`);
    } finally {
      setIsPrintingUsb(false);
    }
  };

  const handleManualPairNewUSB = async () => {
    const nav: any = typeof navigator !== "undefined" ? navigator : null;
    if (!nav || !nav.usb) {
      alert("WebUSB is not supported in this browser. Use Chrome, Edge, or Opera.");
      return;
    }
    try {
      const device = await nav.usb.requestDevice({
        filters: [
          { vendorId: 0x0483, productId: 0x5840 }, // Your printer's exact hardware ID
          { vendorId: 0x0483 },                   // STMicroelectronics devices
          { classCode: 7 }                        // Any USB printer Class
        ]
      });
      setUsbDevice(device);
      const devices = await nav.usb.getDevices();
      setPairedDeviceList(devices);
      alert(`Connected successfully to USB device: ${device.productName || "POS Printer"}`);
    } catch (err: any) {
      console.warn("USB pairing canceled or failed:", err);
    }
  };

  return (
    <div id="invoice-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[95vh]"
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
        <div className="p-5 overflow-y-auto flex-1 bg-slate-50 space-y-4">
          
          {/* Print format selector section */}
          <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-sm flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              🔧 Quick Receipt Format
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPrintFormat("58mm-css")}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg border transition cursor-pointer ${
                  printFormat === "58mm-css"
                    ? "bg-teal-50 border-teal-500 text-teal-800"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                58mm Thermal Roll
              </button>
              <button
                onClick={() => setPrintFormat("standard")}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg border transition cursor-pointer ${
                  printFormat === "standard"
                    ? "bg-teal-50 border-teal-500 text-teal-800"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                Standard Mini (4"x6")
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm max-w-sm mx-auto relative relative-after-waves">
            {/* Ribbon Cut visual effect */}
            <div className="text-center pb-4 border-b-2 border-dashed border-slate-200">
              <h2 className="font-display font-bold text-lg tracking-wide text-slate-800 uppercase">
                PE COMPUTERS & BOOKSHOP
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
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

            <div className="py-3">
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
                      <td className="py-2 max-w-[180px] break-words">
                        <div className="font-semibold text-slate-800 text-[11px]">{item.name}</div>
                        {item.warranty && item.warranty !== "No Warranty" && (
                          <div className="text-[9px] text-teal-600 font-bold mt-1 inline-flex items-center gap-1 bg-teal-50 px-2 py-0.5 rounded-md">
                            🛡️ {item.warranty}
                          </div>
                        )}
                      </td>
                      <td className="py-2 text-center text-[11px]">{item.quantity}</td>
                      <td className="py-2 text-right font-semibold text-[11px]">{formatLKR(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-dashed border-slate-200 mt-3 pt-2.5 space-y-1 text-xs font-mono text-slate-600">
                <div className="flex justify-between text-[11px]">
                  <span>Subtotal:</span>
                  <span>{formatLKR(bill.subtotal)}</span>
                </div>
                {bill.discount > 0 && (
                  <div className="flex justify-between text-[11px] text-rose-600">
                    <span>Discount ({bill.discount}%):</span>
                    <span>-{formatLKR(bill.subtotal * (bill.discount / 100))}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-2 font-display">
                  <span>TOTAL:</span>
                  <span>{formatLKR(bill.total)}</span>
                </div>
              </div>
            </div>

            <div className="text-center pt-2.5 border-t border-slate-100 text-[10px] text-slate-400 italic">
              Thank You For Supporting PE Computers & Bookshop!
            </div>
          </div>

          {/* WebUSB Direct Printer integration */}
          <div className="bg-slate-100/80 rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Usb className="w-4 h-4 text-teal-600" />
                Direct USB 58mm Printer
              </span>
              <span className="text-[9px] bg-teal-100 text-teal-800 px-1.5 py-0.5 font-bold uppercase rounded-md">
                Bypasses Print Dialogue
              </span>
            </div>

            {usbDevice ? (
              <div className="text-[11px] bg-teal-50/50 border border-teal-100 rounded-lg p-2.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-teal-950 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-teal-650" />
                    Connected USB Printer
                  </p>
                  <p className="text-slate-500 font-mono mt-0.5">
                    {usbDevice.productName || `Device Vendor [${usbDevice.vendorId.toString(16)}]`}
                  </p>
                </div>
                <button
                  onClick={handleManualPairNewUSB}
                  className="p-1 px-2.5 text-[10px] font-bold bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-all text-slate-600 flex items-center gap-1"
                  title="Connect different USB Printer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Change
                </button>
              </div>
            ) : (
              <div className="text-center py-2">
                <button
                  onClick={handleManualPairNewUSB}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Usb className="w-3.5 h-3.5" />
                  Link 58mm USB ESC/POS Printer
                </button>
                <p className="text-[10px] text-slate-400 mt-1.5 font-medium leading-normal pl-1 text-left">
                  Connect your 58mm printer via USB, click to grant permissions, and gain instant, direct printing capabilities with a single click!
                </p>
              </div>
            )}

            {usbDevice && (
              <button
                onClick={handleRegisterAndPrintUSB}
                disabled={isPrintingUsb}
                className="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-teal-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition duration-150 flex items-center justify-center gap-1.5 shadow-md shadow-teal-500/10 cursor-pointer"
              >
                {isPrintingUsb ? (
                  <span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                ) : (
                  <Printer className="w-4 h-4 stroke-[2.5]" />
                )}
                <span>Direct USB Print (ESC/POS 58mm)</span>
              </button>
            )}
          </div>

        </div>

        {/* Modal actions */}
        <div className="px-5 py-4 bg-slate-100 border-t border-slate-200 flex gap-3">
          <button
            id="print-action-btn"
            onClick={printFormat === "58mm-css" ? handlePrint58mmCSS : handlePrintStandard}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition active:scale-95 shadow-md shadow-teal-700/10 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print {printFormat === "58mm-css" ? "58mm Receipt" : "Mini Receipt"}</span>
          </button>
          <button
            id="done-action-btn"
            onClick={onClose}
            className="px-5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
