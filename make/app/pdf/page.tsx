"use client";

import React, { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import Image from "next/image";
import Loading from "@/public/loginIcons/loading.png";
import Navigation from "@/components/navigation";
import { makeEmpty } from "@/state/cart/cartSlice";

const Page = () => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, company, loading } = useSelector(
    (state: RootState) => state.api,
  );
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const grandTotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + Number(item.totalCost || 0),
      0,
    );
  }, [cartItems]);

  const createdAt = cartItems[0]?.createdAt;
  const salesAgent = cartItems[0]?.salesAgent || user?.name || "-";
  const companyName = cartItems[0]?.companyName || company?.name || "ByteForge Printing";
  const companyEmail = cartItems[0]?.companyEmail || company?.email || "-";

  const uniqueCustomers = Array.from(
    new Set(cartItems.map((item) => item.customerName).filter(Boolean)),
  );
  const uniquePhones = Array.from(
    new Set(cartItems.map((item) => item.customerPhone).filter(Boolean)),
  );

  const clearCart = () => {
    dispatch(makeEmpty());
    router.push("/");
  };

  const generatePDF = async () => {
    if (!invoiceRef.current || isGenerating) return;

    if (cartItems.length === 0) {
      setError("Quotation cart is empty. Add items from the calculator first.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        onclone: (doc) => {
          const root = doc.documentElement;
          root.style.setProperty("--color-white", "#ffffff");
          root.style.setProperty("--color-black", "#0f172a");
          root.style.setProperty("--color-gray-100", "#f8fafc");
          root.style.setProperty("--color-gray-200", "#e2e8f0");
          root.style.setProperty("--color-gray-500", "#64748b");
          root.style.setProperty("--color-blue-600", "#2563eb");
          root.style.setProperty("--color-red-600", "#dc2626");
        },
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`proforma-quotation-${Date.now()}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF", err);
      setError("Failed to generate PDF document. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading === false && user) {
    return (
      <div className="bg-slate-950 min-h-screen text-slate-100 antialiased font-sans">
        <Navigation />

        <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
          {/* TOOLBAR */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-md">
            <div>
              <h1 className="text-base font-bold text-white">
                Proforma Invoice & Quotation
              </h1>
              <p className="text-xs text-slate-400">
                Review items and export client-ready PDF quotation document.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={generatePDF}
                disabled={isGenerating}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {isGenerating ? "Exporting PDF..." : "Download PDF Document"}
              </button>
              <button
                onClick={() => router.push("/")}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-lg border border-slate-700 transition-colors"
              >
                Back to Calculator
              </button>
              <button
                onClick={clearCart}
                className="bg-slate-950 hover:bg-rose-950/40 text-rose-400 text-xs font-medium px-4 py-2 rounded-lg border border-rose-900/30 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-900/50 rounded-lg text-xs text-rose-300 text-center">
              {error}
            </div>
          )}

          {/* INVOICE PAPER DOCUMENT CONTAINER */}
          <div className="flex justify-center pb-12">
            <div
              ref={invoiceRef}
              className="w-[210mm] min-h-[297mm] bg-white text-slate-900 p-10 rounded-xl shadow-2xl border border-slate-200 flex flex-col justify-between"
              style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
            >
              <div className="space-y-8">
                {/* DOCUMENT HEADER */}
                <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">
                      {companyName}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Professional Printing & Signage Solutions
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="inline-block bg-slate-100 text-slate-800 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded border border-slate-200">
                      PROFORMA INVOICE
                    </span>
                    <p className="text-xs text-slate-500 pt-1">
                      Date:{" "}
                      <span className="font-semibold text-slate-700">
                        {createdAt
                          ? new Date(createdAt).toLocaleDateString()
                          : new Date().toLocaleDateString()}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500">
                      Sales Agent:{" "}
                      <span className="font-semibold text-slate-700">
                        {salesAgent}
                      </span>
                    </p>
                  </div>
                </div>

                {/* ADDRESS & BILL TO GRID */}
                <div className="grid grid-cols-2 gap-8 text-xs">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Issued By
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {companyName}
                    </h3>
                    <p className="text-slate-600">Addis Ababa, Ethiopia</p>
                    <p className="text-slate-600">Email: {companyEmail}</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Billed To
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {uniqueCustomers.length === 0
                        ? "Valued Customer"
                        : uniqueCustomers.length === 1
                          ? uniqueCustomers[0]
                          : "Multiple Clients"}
                    </h3>
                    <p className="text-slate-600">
                      Phone:{" "}
                      {uniquePhones.length === 0
                        ? "-"
                        : uniquePhones.length === 1
                          ? uniquePhones[0]
                          : "Multiple Contact Numbers"}
                    </p>
                  </div>
                </div>

                {/* ITEMS TABLE */}
                <div className="overflow-hidden border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                        <th className="p-3 w-10 text-center">#</th>
                        <th className="p-3">Item / Product</th>
                        <th className="p-3">Specification Details</th>
                        <th className="p-3 text-center w-16">Qty</th>
                        <th className="p-3 text-right w-28">Unit Price</th>
                        <th className="p-3 text-right w-28">Total (ETB)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {cartItems.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="p-8 text-center text-slate-400 text-xs italic"
                          >
                            No items added to quotation cart yet.
                          </td>
                        </tr>
                      ) : (
                        cartItems.map((item, index) => (
                          <tr key={item.id} className="text-slate-800">
                            <td className="p-3 text-center text-slate-400 font-mono">
                              {index + 1}
                            </td>
                            <td className="p-3 font-semibold text-slate-900">
                              {item.product || "Printing Service"}
                            </td>
                            <td className="p-3 text-slate-600 text-[11px] leading-relaxed">
                              {item.description || "-"}
                            </td>
                            <td className="p-3 text-center font-mono font-medium">
                              {item.quantity || 1}
                            </td>
                            <td className="p-3 text-right font-mono">
                              {Number(item.singleItemCost || 0).toFixed(2)}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-slate-900">
                              {Number(item.totalCost || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* GRAND TOTAL */}
                <div className="flex justify-end pt-4">
                  <div className="w-64 bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-2 text-right">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Subtotal</span>
                      <span className="font-mono">{grandTotal.toFixed(2)} ETB</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-2">
                      <span>Total Amount</span>
                      <span className="font-mono text-blue-600">
                        {grandTotal.toFixed(2)} ETB
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* DOCUMENT FOOTER */}
              <div className="border-t border-slate-200 pt-6 mt-12 flex justify-between items-end text-[11px] text-slate-500">
                <div>
                  <p className="font-semibold text-slate-700">Terms & Conditions:</p>
                  <p>Valid for 15 days from date of issuance. Thank you for your business!</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-400">
                    Powered by ByteForge
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-slate-950">
      <Image src={Loading} alt="Loading" className="animate-spin w-10 opacity-80" />
    </div>
  );
};

export default Page;
