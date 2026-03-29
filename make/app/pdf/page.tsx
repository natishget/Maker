"use client";

import React, { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import Image from "next/image";
import Loading from "@/public/loginIcons/loading.png";

import { makeEmpty } from "@/state/cart/cartSlice";

const Page = () => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, company, loading, initialized } = useSelector(
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
  const companyName = cartItems[0]?.companyName || company?.name || "-";
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
      setError("Cart is empty. Add items from calculator first.");
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
          root.style.setProperty("--color-black", "#000000");
          root.style.setProperty("--color-gray-100", "#f3f4f6");
          root.style.setProperty("--color-gray-200", "#e5e7eb");
          root.style.setProperty("--color-gray-500", "#6b7280");
          root.style.setProperty("--color-blue-600", "#2563eb");
          root.style.setProperty("--color-red-600", "#dc2626");
        },
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("proforma-invoice.pdf");
    } catch (err) {
      console.error("Failed to generate PDF", err);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading === false && user) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="flex gap-3">
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isGenerating ? "Generating..." : "Download PDF"}
            </button>
            <button
              onClick={() => router.push("/")}
              className="bg-gray-600 text-white px-4 py-2 rounded"
            >
              Back
            </button>
            <button
              onClick={clearCart}
              className="bg-gray-600 text-white px-4 py-2 rounded"
            >
              Clear Cart
            </button>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div
            ref={invoiceRef}
            className="w-[210mm] p-10"
            style={{ backgroundColor: "#ffffff", color: "#000000" }}
          >
            {/* HEADER */}
            <div className="flex justify-between items-center border-b pb-4">
              <img src="/logo.png" alt="logo" className="w-32" />
              <div className="text-right">
                <h1 className="text-2xl font-bold">PROFORMA INVOICE</h1>
                <p className="text-sm">
                  Date:{" "}
                  {createdAt ? new Date(createdAt).toLocaleDateString() : "-"}
                </p>
                <p className="text-sm">Sales Agent: {salesAgent}</p>
              </div>
            </div>

            {/* COMPANY INFO */}
            <div className="mt-4">
              <h2 className="font-bold text-lg">{companyName}</h2>
              <p className="text-sm">Addis Ababa, Ethiopia</p>
              <p className="text-sm">Phone: +251-9XXXXXXXX</p>
              <p className="text-sm">Email: {companyEmail}</p>
            </div>

            {/* CLIENT */}
            <div className="mt-6">
              <h3 className="font-semibold">Bill To:</h3>
              <p>
                {uniqueCustomers.length === 0
                  ? "-"
                  : uniqueCustomers.length === 1
                    ? uniqueCustomers[0]
                    : "Multiple customers"}
              </p>
              <p className="text-sm">
                Phone:{" "}
                {uniquePhones.length === 0
                  ? "-"
                  : uniquePhones.length === 1
                    ? uniquePhones[0]
                    : "Multiple phone numbers"}
              </p>
            </div>

            {/* TABLE */}
            <table className="w-full mt-6 border">
              <thead>
                <tr className="text-sm" style={{ backgroundColor: "#e5e7eb" }}>
                  <th className="border p-2">#</th>
                  <th className="border p-2">Customer</th>
                  <th className="border p-2">Product</th>
                  <th className="border p-2">Description</th>
                  <th className="border p-2">Qty</th>
                  <th className="border p-2">Unit Price</th>
                  <th className="border p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.length === 0 ? (
                  <tr className="text-sm text-center">
                    <td className="border p-2" colSpan={7}>
                      No items in cart
                    </td>
                  </tr>
                ) : (
                  cartItems.map((item, index) => (
                    <tr key={item.id} className="text-sm text-center">
                      <td className="border p-2">{index + 1}</td>
                      <td className="border p-2">{item.customerName || "-"}</td>
                      <td className="border p-2">{item.product || "-"}</td>
                      <td className="border p-2">{item.description || "-"}</td>
                      <td className="border p-2">{item.quantity || "-"}</td>
                      <td className="border p-2">
                        {item.singleItemCost || "-"}
                      </td>
                      <td className="border p-2">{item.totalCost || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* TOTAL */}
            <div className="flex justify-end mt-6">
              <div className="text-right">
                <p className="text-lg font-bold">
                  Total: {grandTotal.toFixed(2)} ETB
                </p>
              </div>
            </div>

            {/* FOOTER */}
            <div
              className="flex justify-between mt-10 text-sm"
              style={{ color: "#6b7280" }}
            >
              <p>Thank you for your business!</p>
              <p>Powered By ByteForge 🚀</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-[rgb(15,12,41)] from-0% via-[rgb(48,43,99)] via-50% to-[rgb(36,36,62)] to-100%">
      <Image src={Loading} alt="Loading" className="animate-spin w-10" />
    </div>
  );
};

export default Page;
