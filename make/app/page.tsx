"use client";

import { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/state/store";
import { getCompanyDataAsync } from "@/state/API/ApiSlice";
import { AddItem } from "@/state/cart/cartSlice";
import type { CartItem } from "@/state/cart/cartSlice";

import { useRouter } from "next/navigation";

import Image from "next/image";
import Loading from "@/public/loginIcons/loading.png";

import Navigation from "@/components/navigation";

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, company, loading, initialized } = useSelector(
    (state: RootState) => state.api,
  );
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [form, setForm] = useState({
    pages: "",
    quantity: "",
    paperSize: "1",
    rim: "",
    coverRim: "",
    printType: "2",
    cost: "",
    coverCost: "",
    laminationCost: "",
    perfectBindingCost: "",
    wasteFactor: "",
    plateCost: "",
    overAllCost: "",
    profitMargin: "",
    colorCover: "",
    colorInside: "",
    otherOne: "",
    otherTwo: "",
    customerName: "",
    customerPhone: "",
  });
  const [calculationType, setCalculationType] = useState(1);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const getCompanyInfo = async () => {
    console.log("Attempting to fetch company data for user:", user);
    try {
      const response = await dispatch(getCompanyDataAsync()).unwrap();
      console.log("Company Info:", response);
    } catch (error) {
      console.error("Error fetching company info:", error);
    }
  };

  useEffect(() => {
    if (initialized && !user) {
      router.push("/login");
    }
  }, [initialized, user, router]);

  useEffect(() => {
    if (initialized && user && !company) {
      void getCompanyInfo();
    }
  }, [initialized, user?.id, company]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({
      ...form,
      [e.target.id]: e.target.value,
    });
  };

  const handleChangeOfType = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setCalculationType(Number(e.target.value));
  };

  const calculateBook = () => {
    let P = Number(form.pages);
    const Q = Number(form.quantity);
    const n = Number(form.paperSize);
    const R = Number(form.rim);
    const CoverRim = Number(form.coverRim);
    const printType = Number(form.printType);
    const cost = Number(form.cost);
    const CoverCost = Number(form.coverCost);
    const LaminationCost = Number(form.laminationCost);
    const PerfectBindingCost = Number(form.perfectBindingCost);
    let wasteFactor = Number(form.wasteFactor);
    let PlateCost = Number(form.plateCost);
    const OverAllCost = Number(form.overAllCost);
    const ProfitMargin = Number(form.profitMargin);
    const colorCover = Number(form.colorCover);
    const colorInside = Number(form.colorInside);
    const OtherOne = Number(form.otherOne);
    const OtherTwo = Number(form.otherTwo);

    if (!P || !Q || !n || R <= 0) {
      setError("Please enter valid values");
      return;
    }

    setError("");

    if (printType === 1) {
      P = P * 2;
      PlateCost = PlateCost / 2;
    }

    wasteFactor = wasteFactor / 100 + 1;

    const PageResult = (P * Q) / (R * Math.pow(2, n));
    const resultPaper = PageResult / 2;
    const TotalPaperRims = resultPaper * wasteFactor;

    const CoverPageResult =
      CoverRim !== 0 ? Q / (CoverRim * (Math.pow(2, n) / 2)) : 0;

    const TotalCoverResult = CoverPageResult * wasteFactor;

    const TotalPlate = (P / Math.pow(2, n - 1)) * colorInside + colorCover;

    const TotalPlateCost = TotalPlate * PlateCost;

    const LaminationTotalCost = LaminationCost * Q;
    const PerfectBindingTotalCost = PerfectBindingCost * Q;

    let CostBefore =
      TotalPaperRims * cost +
      TotalCoverResult * CoverCost +
      TotalPlateCost +
      LaminationTotalCost +
      PerfectBindingTotalCost;

    if (OtherOne) CostBefore += OtherOne * Q;
    if (OtherTwo) CostBefore += OtherTwo * Q;

    const OverAllCostAmount = (OverAllCost / 100) * CostBefore;
    const ProfitMarginAmount =
      (ProfitMargin / 100) * (CostBefore + OverAllCostAmount);

    const TotalCost = CostBefore + OverAllCostAmount + ProfitMarginAmount;
    const singleItemCost = TotalCost / Q;

    setResult({
      resultPaper,
      TotalPaperRims,
      CoverPageResult,
      TotalCoverResult,
      paperCost: TotalPaperRims * cost,
      coverCostTotal: TotalCoverResult * CoverCost,
      TotalPlate,
      TotalPlateCost,
      PerfectBindingTotalCost,
      OverAllCostAmount,
      ProfitMarginAmount,
      TotalCost,
      singleItemCost,
    });
  };

  const calculateBrochurs = () => {
    const Q = Number(form.quantity);
    const n = Number(form.paperSize);
    const R = Number(form.rim);
    const cost = Number(form.cost);
    const LaminationCost = Number(form.laminationCost);
    let wasteFactor = Number(form.wasteFactor);
    let PlateCost = Number(form.plateCost);
    const OverAllCost = Number(form.overAllCost);
    const ProfitMargin = Number(form.profitMargin);
    const colorInside = Number(form.colorInside);
    const OtherOne = Number(form.otherOne);
    const OtherTwo = Number(form.otherTwo);

    if (!Q || !n || R <= 0) {
      setError("Please enter valid values");
      return;
    }

    setError("");

    wasteFactor = wasteFactor / 100 + 1;

    const result = Q / (R * Math.pow(2, n));
    const TotalPaperRims = result * wasteFactor;
    const TotalPlate = colorInside;
    const TotalPlateCost = TotalPlate * PlateCost;

    const LaminationTotalCost = LaminationCost * Q;

    let CostBefore =
      TotalPaperRims * cost + TotalPlateCost + LaminationTotalCost;

    if (OtherOne) CostBefore += OtherOne * Q;
    if (OtherTwo) CostBefore += OtherTwo * Q;

    const OverAllCostAmount = (OverAllCost / 100) * CostBefore;
    const ProfitMarginAmount =
      (ProfitMargin / 100) * (CostBefore + OverAllCostAmount);

    const TotalCost = CostBefore + OverAllCostAmount + ProfitMarginAmount;

    setResult({
      TotalPaperRims,
      paperCost: TotalPaperRims * cost,
      TotalPlate,
      TotalPlateCost,
      OverAllCostAmount,
      ProfitMarginAmount,
      TotalCost,
      singleItemCost: TotalCost / Q,
    });
  };

  const GeneratePdfData = () => {
    if (!cartItems.length) {
      alert("Cart is empty. Add at least one item before generating PDF.");
      return;
    }

    router.push("/pdf");
  };

  const sendToTelegram = async () => {
    const secondMessage = `📄 Service Request

👤 Customer: ${form.customerName}
📞 Phone: ${form.customerPhone}

📦 Type: ${calculationType === 1 ? "Book Related" : "Brochure Related"}
${calculationType === 1 ? `📑 Pages: ${form.pages}` : ""}
🔢 Quantity: ${form.quantity}

💰 Total Cost: *\`${result.TotalCost.toFixed(2)}\`*
💵 Single Item Cost: *\`${result.singleItemCost.toFixed(2)}\`*



📅 Date: ${new Date().toLocaleString()}
🧑 Sales Agent: ${user?.name}


${company?.name}
${company?.email}
Powered By ByteForge 🚀`;

    const message = `📄 Service Request (staff only)👆

👤 Customer: ${form.customerName}
📞 Phone: ${form.customerPhone}

📦 Type: ${calculationType === 1 ? "Book Related" : "Brochure Related"}
${calculationType === 1 ? `📑 Pages: ${form.pages}` : ""}
🔢 Quantity: ${form.quantity}
📖 Inside paper per rim: ${form.rim}
💰 Rim cost: ${form.cost}
${
  calculationType === 1
    ? `📕 Cover paper per rim: ${form.coverRim}
💰 Cover rim cost: ${form.coverCost}
🎨 Color for inside: ${form.colorInside}
🎨 Color for cover: ${form.colorCover}`
    : ""
}
📄 Print size: ${form.paperSize === "1" ? "A2" : form.paperSize === "2" ? "A3" : form.paperSize === "3" ? "A4" : form.paperSize === "4" ? "A5" : form.paperSize === "5" ? "A6" : form.paperSize === "6" ? "A7" : "Unknown"}
🖨️ Print type: ${form.printType === "1" ? "1 Side" : "2 Side"}
🖥️ Plate cost: ${form.plateCost}
📑 Lamination cost: ${form.laminationCost}
${calculationType === 1 ? `📎 Binding cost: ${form.perfectBindingCost}` : ""}
🗑️ Waste factor: ${form.wasteFactor}%
📈 Overall cost: ${form.overAllCost}%
📊 Profit margin: ${form.profitMargin}%


💰 Total Cost: *\`${result.TotalCost.toFixed(2)}\`*
💵 Single Item Cost: *\`${result.singleItemCost.toFixed(2)}\`*



📅 Date: ${new Date().toLocaleString()}
🧑 Sales Agent: ${user?.name}

${company?.name}
${company?.email}
Powered By ByteForge 🚀`;
    const botToken = company?.tg_bot_token;
    const chatId = company?.tg_chat_id?.toString();

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: "Markdown",
          }),
        },
      );
      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.description || "Failed to send firstmessage");
      }

      const response2 = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: secondMessage,
            parse_mode: "Markdown",
          }),
        },
      );
      const data2 = await response2.json();
      if (!data2.ok) {
        throw new Error(data2.description || "Failed to send Second message");
      }
      alert("Message sent successfully!");
    } catch (error) {
      console.error("Error sending message to Telegram:", error);
    }
  };

  const emptyForm = () => {
    setForm({
      pages: "",
      quantity: "",
      paperSize: "1",
      rim: "",
      coverRim: "",
      printType: "2",
      cost: "",
      coverCost: "",
      laminationCost: "",
      perfectBindingCost: "",
      wasteFactor: "",
      plateCost: "",
      overAllCost: "",
      profitMargin: "",
      colorCover: "",
      colorInside: "",
      otherOne: "",
      otherTwo: "",
      customerName: "",
      customerPhone: "",
    });
    setResult(null);
  };

  const addItemToCart = () => {
    if (!form.customerName || !form.customerPhone)
      return alert(
        "Please enter customer name and phone number before adding to cart.",
      );

    if (!result) {
      return;
    }

    const item: CartItem = {
      id: Date.now().toString(),
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      product: calculationType === 1 ? "Book" : "Brochure",
      quantity: Number(form.quantity),
      description: `Pages: ${form.pages}, Paper Size: ${form.paperSize}, Print Type: ${form.printType}, Color Inside: ${form.colorInside}, Color Cover: ${form.colorCover}`,
      totalCost: result.TotalCost.toFixed(2),
      singleItemCost: result.singleItemCost.toFixed(2),
      salesAgent: user?.name || "",
      companyName: company?.name || "",
      companyEmail: company?.email || "",
      createdAt: new Date().toISOString(),
    };

    dispatch(AddItem(item));

    alert("Item added to cart successfully!");
    emptyForm();
  };

  if (loading === false && user) {
    return (
      <div className="bg-gray-100 min-h-screen w-full overflow-y-hidden overflow-x-hidden">
        <Navigation />
        <div className=" flex  justify-center p-6 text-black justify-center bg-gradient-to-br from-[rgb(15,12,41)] from-0% via-[rgb(48,43,99)] via-50% to-[rgb(36,36,62)] to-100% overflow-y-hidden">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl space-y-4 overflow-y-auto no-scrollbar">
            <h2 className="text-xl font-bold text-center">
              {calculationType === 1
                ? "Book Calculator"
                : "Brochure Calculator"}
            </h2>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            {/* Inputs */}

            <Select
              id="calculationType"
              label="Calculation For"
              value={calculationType}
              onChange={handleChangeOfType}
              options={[
                { value: 1, label: "Book" },
                { value: 2, label: "Brochures" },
              ]}
            />
            <div className={calculationType === 1 ? "" : "hidden"}>
              <Input
                id="pages"
                label="Pages without cover"
                value={form.pages}
                onChange={handleChange}
              />
            </div>
            <Input
              id="quantity"
              label="Quantity"
              value={form.quantity}
              onChange={handleChange}
            />

            <div className={calculationType === 1 ? "" : "hidden"}>
              <Select
                id="printType"
                label="Print Type"
                value={form.printType}
                onChange={handleChange}
                options={[
                  { value: "1", label: "1 Side" },
                  { value: "2", label: "2 Side" },
                ]}
              />
            </div>

            <Select
              id="paperSize"
              label="Paper Size (A2, A3, ..)"
              value={form.paperSize}
              onChange={handleChange}
              options={[
                { value: "1", label: "A2" },
                { value: "2", label: "A3" },
                { value: "3", label: "A4" },
                { value: "4", label: "A5" },
                { value: "5", label: "A6" },
                { value: "6", label: "A7" },
              ]}
            />

            <Select
              id="rim"
              label={
                calculationType === 1
                  ? "Inner Paper Thickness (80 Gram, 100 Gram,...)"
                  : "Brochure Paper Thickness (150 Gram, 200 Gram,...)"
              }
              value={form.rim}
              onChange={handleChange}
              options={[
                { value: "100", label: "300 Gram" },
                { value: "100", label: "250 Gram" },
                { value: "250", label: "150 Gram" },
                { value: "250", label: "100 Gram" },
                { value: "500", label: "80 Gram" },
                { value: "500", label: "60 Gram" },
              ]}
            />

            <Input
              id="cost"
              label={
                calculationType === 1
                  ? "Inner Paper Cost ($ per Rim)"
                  : "Brochure Paper Cost ($ per Rim)"
              }
              value={form.cost}
              onChange={handleChange}
            />
            <div className={calculationType === 1 ? "" : "hidden"}>
              <Select
                id="coverRim"
                label="Cover Paper Thickness (150 Gram, 200 Gram,...)"
                value={form.coverRim}
                onChange={handleChange}
                options={[
                  { value: "100", label: "300 Gram" },
                  { value: "100", label: "250 Gram" },
                  { value: "250", label: "150 Gram" },
                  { value: "250", label: "100 Gram" },
                  { value: "500", label: "80 Gram" },
                  { value: "500", label: "60 Gram" },
                ]}
              />
              <Input
                id="coverCost"
                label="Cover Paper Cost ($ per Rim)"
                value={form.coverCost}
                onChange={handleChange}
              />
            </div>

            <Select
              id="colorInside"
              label="Color for Inside Pages"
              value={form.colorInside}
              onChange={handleChange}
              options={[
                { value: "1", label: "One Color" },
                { value: "2", label: "Two Color" },
                { value: "3", label: "Three Color" },
                { value: "4", label: "Full Color" },
              ]}
            />

            <div className={calculationType === 1 ? "" : "hidden"}>
              <Select
                id="colorCover"
                label="Color for Cover Pages"
                value={form.colorCover}
                onChange={handleChange}
                options={[
                  { value: "1", label: "One Color" },
                  { value: "2", label: "Two Color" },
                  { value: "3", label: "Three Color" },
                  { value: "4", label: "Full Color" },
                ]}
              />
            </div>

            <Input
              id="plateCost"
              label="Plate Cost"
              value={form.plateCost}
              onChange={handleChange}
            />

            <Input
              id="laminationCost"
              label="Lamination Cost"
              value={form.laminationCost}
              onChange={handleChange}
            />

            <div className={calculationType === 1 ? "" : "hidden"}>
              <Input
                id="perfectBindingCost"
                label="Binding Cost"
                value={form.perfectBindingCost}
                onChange={handleChange}
              />
            </div>

            <Input
              id="wasteFactor"
              label="Waste Factor %"
              value={form.wasteFactor}
              onChange={handleChange}
            />

            <Input
              id="overAllCost"
              label="Overall Cost %"
              value={form.overAllCost}
              onChange={handleChange}
            />

            <Input
              id="profitMargin"
              label="Profit Margin %"
              value={form.profitMargin}
              onChange={handleChange}
            />

            <Input
              id="otherOne"
              label="Other One (will be Directly added)"
              value={form.otherOne}
              onChange={handleChange}
            />

            <Input
              id="otherTwo"
              label="Other Two (will be Directly added)"
              value={form.otherTwo}
              onChange={handleChange}
            />

            <button
              onClick={
                calculationType === 1 ? calculateBook : calculateBrochurs
              }
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            >
              Calculate
            </button>

            {/* Results */}

            {result && (
              <div className="space-y-1 text-sm font-semibold">
                <div className="flex justify-evenly ">
                  <div className="border-r border-gray-400 pr-3">
                    <div className="text-blue-600">Required Rims</div>
                    <div className={calculationType === 1 ? "" : "hidden"}>
                      For Inside:{" "}
                      {calculationType === 1 && result.resultPaper.toFixed(2)}
                    </div>
                    <div className={calculationType === 1 ? "" : "hidden"}>
                      For Cover:{" "}
                      {calculationType === 1 &&
                        result.CoverPageResult.toFixed(2)}
                    </div>

                    <div className="text-blue-600">
                      Required Rim{" "}
                      <span className="text-red-600">with Waste</span>
                    </div>
                    <div>For Inside: {result.TotalPaperRims.toFixed(2)}</div>

                    <div className={calculationType === 1 ? "" : "hidden"}>
                      For Cover:{" "}
                      {calculationType === 1 &&
                        result.TotalCoverResult.toFixed(2)}
                    </div>

                    <div>
                      Cost for Inside: {Number(result.paperCost.toFixed(2))}
                    </div>
                    <div className={calculationType === 1 ? "" : "hidden"}>
                      Cost for Cover:{" "}
                      {calculationType === 1 &&
                        result.coverCostTotal.toFixed(2)}
                    </div>

                    <div className="text-yellow-600">
                      Total Paper Cost:{" "}
                      {Number(result.paperCost.toFixed(2)) +
                        Number(
                          calculationType === 1
                            ? result.coverCostTotal.toFixed(2)
                            : 0,
                        )}
                    </div>
                  </div>

                  <div className="border-r border-gray-400 pr-3">
                    <div className="text-blue-600">
                      Cost for Plate and Binding
                    </div>
                    <div>Total Plate: {result.TotalPlate.toFixed(2)}</div>
                    <div>
                      Total Plate Cost: {result.TotalPlateCost.toFixed(2)}
                    </div>{" "}
                    <br />
                    <div className={calculationType === 1 ? "" : "hidden"}>
                      Total Binding Cost:{" "}
                      {calculationType === 1 && result.PerfectBindingTotalCost}
                    </div>
                  </div>

                  <div>
                    <div className="text-blue-600">
                      Overhead Cost and Profit
                    </div>
                    <div>
                      Overhead Cost: {result.OverAllCostAmount.toFixed(2)}
                    </div>
                    <div>Profit: {result.ProfitMarginAmount.toFixed(2)}</div>
                  </div>
                </div>

                <br />

                <div className="text-lg text-green-600">
                  Total Cost: {result.TotalCost.toFixed(2)}
                </div>

                <div className="text-lg text-green-600">
                  Single Item Cost: {result.singleItemCost.toFixed(2)}
                </div>

                <div className="flex justify-evenly gap-1">
                  <Input
                    id="customerName"
                    label="Customer/Company Name"
                    value={form.customerName}
                    type="text"
                    onChange={handleChange}
                  />
                  <Input
                    id="customerPhone"
                    label="Customer/Company Phone"
                    value={form.customerPhone}
                    type="text"
                    onChange={handleChange}
                  />
                </div>
                <div className="flex justify-between">
                  <button
                    className="bg-purple-600 text-white font-sm px-3 py-2 rounded"
                    onClick={addItemToCart}
                  >
                    Add To Cart
                  </button>
                  <button
                    className="bg-blue-600 text-white font-sm px-3 py-2 rounded"
                    onClick={sendToTelegram}
                  >
                    Send To Telegram
                  </button>

                  <button
                    className="bg-green-500 text-white font-sm px-3 py-2 rounded"
                    onClick={GeneratePdfData}
                  >
                    PDF
                  </button>

                  <button
                    className="bg-red-600 text-white font-sm px-3 py-2 rounded"
                    onClick={emptyForm}
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
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
}

function Input({ id, label, value, onChange, type = "number" }: any) {
  return (
    <div id={id}>
      <label className="text-sm">{label}</label>
      <input
        id={id}
        value={value}
        onChange={onChange}
        type={type}
        className="w-full border p-2 rounded mt-1"
      />
    </div>
  );
}

function Select({ id, label, value, onChange, options }: any) {
  return (
    <div id={id}>
      <label className="text-sm">{label}</label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="w-full border p-2 rounded mt-1"
      >
        {/* <option value="">Select</option> */}
        {options.map((opt: any) => (
          <option key={`${opt.value}-${opt.label}`} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
