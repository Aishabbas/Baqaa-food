import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Printer, CheckCircle2, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Safe UTF-8 Base64 Decoding
function safeAtob(str: string) {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch (e) {
    return decodeURIComponent(atob(str));
  }
}

export default function PublicReceipt() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const hash = window.location.hash;
      const queryStr = hash.split("?")[1] || "";
      const params = new URLSearchParams(queryStr);
      const encodedData = params.get("data");

      if (!encodedData) {
        setError("No bill data found in the link.");
        return;
      }

      const decoded = JSON.parse(safeAtob(encodedData));
      if (!decoded.order || !decoded.shop) {
        setError("Invalid bill data format.");
        return;
      }

      setData(decoded);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load receipt details. The link may be broken.");
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-md max-w-sm w-full text-center border border-gray-100">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Bill</h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block bg-orange-500 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-orange-600 transition-colors text-sm"
          >
            Go to POS
          </a>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  const { order, shop, logoSrc } = data;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4 flex flex-col items-center justify-start">
      {/* Receipt Card */}
      <div className="bg-white dark:bg-gray-900 w-full max-w-[400px] px-6 py-8 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-800">
        
        {/* Success Header for digital view */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-950 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          </div>
          <span className="text-[10px] uppercase tracking-wider font-bold text-green-600 bg-green-50 dark:bg-green-950/50 px-2 py-0.5 rounded-full">
            Payment Successful
          </span>
        </div>

        {/* Logo & Shop Header */}
        <div className="text-center mb-6">
          {logoSrc && (
            <img
              src={logoSrc}
              alt={shop.name}
              className="h-16 w-auto mx-auto mb-4 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
            {shop.name}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed max-w-[250px] mx-auto">
            {shop.address}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Contact: {shop.contact}
          </p>
          {shop.gstin && (
            <p className="text-[10px] text-gray-400 mt-1 tracking-wider uppercase">
              GSTIN: {shop.gstin}
            </p>
          )}
        </div>

        <hr className="border-gray-200 dark:border-gray-800 mb-4" />

        {/* Bill Info */}
        <div className="space-y-1.5 mb-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Bill Number:</span>
            <span className="text-gray-900 dark:text-white font-bold">
              #{order.billNumber || order.createdAt.slice(-6).toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Date &amp; Time:</span>
            <span className="text-gray-900 dark:text-white font-semibold text-right">
              {format(new Date(order.createdAt), "dd/MM/yyyy, hh:mm a")}
            </span>
          </div>
          {order.customerPhone && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Phone:</span>
              <span className="text-gray-900 dark:text-white font-semibold">{order.customerPhone}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Payment:</span>
            <span className="text-gray-900 dark:text-white font-semibold">{order.paymentMethod}</span>
          </div>
        </div>

        <hr className="border-gray-200 dark:border-gray-800 mb-4" />

        {/* Items Table */}
        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="text-left pb-2 font-bold text-gray-800 dark:text-gray-200">Item</th>
              <th className="text-center pb-2 font-bold text-gray-800 dark:text-gray-200 w-10">Qty</th>
              <th className="text-right pb-2 font-bold text-gray-800 dark:text-gray-200 w-20">Price</th>
              <th className="text-right pb-2 font-bold text-gray-800 dark:text-gray-200 w-20">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item: any, i: number) => (
              <tr key={i} className="border-b border-gray-55 dark:border-gray-800/50">
                <td className="py-2 text-gray-800 dark:text-gray-200">{item.name}</td>
                <td className="py-2 text-center text-gray-600 dark:text-gray-400">{item.quantity}</td>
                <td className="py-2 text-right text-gray-600 dark:text-gray-400">
                  {formatCurrency(item.price)}
                </td>
                <td className="py-2 text-right text-gray-800 dark:text-gray-200 font-medium">
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr className="border-gray-200 dark:border-gray-800 mb-3" />

        {/* Totals */}
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Subtotal:</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-red-500">
              <span>
                Discount
                {order.discountType === "percentage" ? ` (${order.discountValue}%)` : ""}:
              </span>
              <span>-{formatCurrency(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-black text-gray-900 dark:text-white pt-1 border-t border-gray-100 dark:border-gray-800 mt-2">
            <span>Total:</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 pt-4 border-t border-dashed border-gray-200 dark:border-gray-800">
          <p className="font-bold text-gray-900 dark:text-white text-sm">
            Thank You! Visit Again!
          </p>
        </div>
      </div>

      {/* Page Actions */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900 rounded-xl font-bold hover:bg-gray-700 dark:hover:bg-gray-100 active:scale-95 transition-all text-sm shadow-md"
        >
          <Printer className="w-4 h-4" /> Print Receipt
        </button>
      </div>
    </div>
  );
}
