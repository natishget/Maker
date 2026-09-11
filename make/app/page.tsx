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
import { z } from "zod";
import { useForm, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  calculatorSchema,
  customerDetailsSchema,
} from "@/lib/validationSchema";

type CalculatorFormData = z.infer<typeof calculatorSchema>;

type CalculationResult = {
  resultPaper?: number;
  TotalPaperRims: number;
  CoverPageResult?: number;
  TotalCoverResult?: number;
  paperCost: number;
  coverCostTotal?: number;
  TotalPlate: number;
  TotalPlateCost: number;
  PerfectBindingTotalCost?: number;
  OverAllCostAmount: number;
  ProfitMarginAmount: number;
  TotalCost: number;
  singleItemCost: number;
};

const defaultValues: CalculatorFormData = {
  calculationType: "1",
  pages: "",
  quantity: "",
  paperSize: "A2",
  rim: "80",
  coverRim: "250",
  printType: "2",
  cost: "",
  coverCost: "",
  laminationCost: "",
  perfectBindingCost: "",
  wasteFactor: "",
  plateCost: "",
  overAllCost: "",
  profitMargin: "",
  colorCover: "1",
  colorInside: "1",
  otherOne: "",
  otherTwo: "",
  customerName: "",
  customerPhone: "",
};

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, company, loading, initialized } = useSelector(
    (state: RootState) => state.api,
  );
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [submittedData, setSubmittedData] = useState<CalculatorFormData | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CalculatorFormData>({
    resolver: zodResolver(calculatorSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues,
  });

  const calculationType = watch("calculationType");

  const getCompanyInfo = async () => {
    try {
      await dispatch(getCompanyDataAsync()).unwrap();
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

  const calculateBook = (data: CalculatorFormData) => {
    let P = Number(data.pages);
    const Q = Number(data.quantity);
    const n =
      data.paperSize === "A2"
        ? 1
        : data.paperSize === "A3"
          ? 2
          : data.paperSize === "A4"
            ? 3
            : data.paperSize === "A5"
              ? 4
              : data.paperSize === "A6"
                ? 5
                : 6;
    const R =
      data.rim === "300"
        ? 100
        : data.rim === "250"
          ? 100
          : data.rim === "150"
            ? 250
            : data.rim === "100"
              ? 250
              : data.rim === "80"
                ? 500
                : 500;
    const CoverRim =
      data.coverRim === "300"
        ? 100
        : data.coverRim === "250"
          ? 100
          : data.coverRim === "150"
            ? 250
            : data.coverRim === "100"
              ? 250
              : data.coverRim === "80"
                ? 500
                : data.coverRim === "60"
                  ? 500
                  : 0;

    const printType = Number(data.printType);
    const cost = Number(data.cost);
    const CoverCost = Number(data.coverCost);
    const LaminationCost = Number(data.laminationCost);
    const PerfectBindingCost = Number(data.perfectBindingCost);
    let wasteFactor = Number(data.wasteFactor);
    let PlateCost = Number(data.plateCost);
    const OverAllCost = Number(data.overAllCost);
    const ProfitMargin = Number(data.profitMargin);
    const colorCover = Number(data.colorCover);
    const colorInside = Number(data.colorInside);
    const OtherOne = Number(data.otherOne);
    const OtherTwo = Number(data.otherTwo);

    if (printType === 1) {
      P *= 2;
      PlateCost /= 2;
    }

    wasteFactor = wasteFactor / 100 + 1;

    const PageResult = (P * Q) / (R * Math.pow(2, n));
    const resultPaper = PageResult / 2;
    const TotalPaperRims = resultPaper * wasteFactor;

    const CoverPageResult =
      CoverRim > 0 && CoverCost > 0 ? Q / (CoverRim * (Math.pow(2, n) / 2)) : 0;

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
      singleItemCost: TotalCost / Q,
    });
    setSubmittedData(data);
  };

  const calculateBrochurs = (data: CalculatorFormData) => {
    const Q = Number(data.quantity);
    const n =
      data.paperSize === "A2"
        ? 1
        : data.paperSize === "A3"
          ? 2
          : data.paperSize === "A4"
            ? 3
            : data.paperSize === "A5"
              ? 4
              : data.paperSize === "A6"
                ? 5
                : 6;
    const R = Number(data.rim);
    const cost = Number(data.cost);
    const LaminationCost = Number(data.laminationCost);
    let wasteFactor = Number(data.wasteFactor);
    const PlateCost = Number(data.plateCost);
    const OverAllCost = Number(data.overAllCost);
    const ProfitMargin = Number(data.profitMargin);
    const colorInside = Number(data.colorInside);
    const OtherOne = Number(data.otherOne);
    const OtherTwo = Number(data.otherTwo);

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
    setSubmittedData(data);
  };

  const onCalculate = (data: CalculatorFormData) => {
    if (data.calculationType === "1") {
      calculateBook(data);
      return;
    }

    calculateBrochurs(data);
  };

  const validateCustomerFields = () => {
    const currentValues = getValues();
    const parsedCustomer = customerDetailsSchema.safeParse(currentValues);

    if (!parsedCustomer.success) {
      parsedCustomer.error.issues.forEach((issue) => {
        const field = issue.path[0] as "customerName" | "customerPhone";
        setError(field, {
          type: "manual",
          message: issue.message,
        });
      });
      return null;
    }

    clearErrors(["customerName", "customerPhone"]);
    return parsedCustomer.data;
  };

  const GeneratePdfData = () => {
    if (!result || !submittedData) {
      if (!cartItems.length) {
        alert("Please calculate an estimate or add items to cart before generating PDF.");
        return;
      }
      router.push("/pdf");
      return;
    }

    const currentValues = validateCustomerFields();
    if (!currentValues) {
      return;
    }

    const item: CartItem = {
      id: Date.now().toString(),
      customerName: currentValues.customerName,
      customerPhone: currentValues.customerPhone,
      product: submittedData.calculationType === "1" ? "Book" : "Brochure",
      quantity: Number(submittedData.quantity),
      description: `Pages: ${submittedData.pages || "N/A"}, Paper Size: ${submittedData.paperSize}, Print Type: ${submittedData.printType || "2 Side"}, Color Inside: ${submittedData.colorInside}, Color Cover: ${submittedData.colorCover || "N/A"}`,
      totalCost: result.TotalCost.toFixed(2),
      singleItemCost: result.singleItemCost.toFixed(2),
      salesAgent: user?.name || "",
      companyName: company?.name || "",
      companyEmail: company?.email || "",
      createdAt: new Date().toISOString(),
    };

    dispatch(AddItem(item));
    router.push("/pdf");
  };

  const sendToTelegram = async () => {
    if (!result || !submittedData) {
      alert("Please calculate the item before sending it to Telegram.");
      return;
    }

    const currentValues = validateCustomerFields();
    if (!currentValues) {
      return;
    }

    const secondMessage = `SERVICE REQUEST

Customer: ${currentValues.customerName}
Phone: ${currentValues.customerPhone}

Type: ${submittedData.calculationType === "1" ? "Book Related" : "Brochure Related"}
${submittedData.calculationType === "1" ? `Pages: ${submittedData.pages}` : ""}
Quantity: ${submittedData.quantity}

Total Cost: ${result.TotalCost.toFixed(2)} ETB
Single Item Cost: ${result.singleItemCost.toFixed(2)} ETB

Date: ${new Date().toLocaleString()}
Sales Agent: ${user?.name}

${company?.name}
${company?.email}
Powered By ByteForge`;

    const message = `SERVICE REQUEST (Internal Staff Copy)

Customer: ${currentValues.customerName}
Phone: ${currentValues.customerPhone}

Type: ${submittedData.calculationType === "1" ? "Book Related" : "Brochure Related"}
${submittedData.calculationType === "1" ? `Pages: ${submittedData.pages}` : ""}
Quantity: ${submittedData.quantity}
Inside paper per rim: ${submittedData.rim}
Rim cost: ${submittedData.cost}
${
  submittedData.calculationType === "1"
    ? `Cover paper per rim: ${submittedData.coverRim}
Cover rim cost: ${submittedData.coverCost}
Color for inside: ${submittedData.colorInside}
Color for cover: ${submittedData.colorCover}`
    : ""
}
Print size: ${submittedData.paperSize}
Print type: ${submittedData.printType === "1" ? "1 Side" : "2 Side"}
Plate cost: ${submittedData.plateCost}
Lamination cost: ${submittedData.laminationCost}
${submittedData.calculationType === "1" ? `Binding cost: ${submittedData.perfectBindingCost}` : ""}
Waste factor: ${submittedData.wasteFactor}%
Overall cost: ${submittedData.overAllCost}%
Profit margin: ${submittedData.profitMargin}%

Total Cost: ${result.TotalCost.toFixed(2)} ETB
Single Item Cost: ${result.singleItemCost.toFixed(2)} ETB

Date: ${new Date().toLocaleString()}
Sales Agent: ${user?.name}

${company?.name}
${company?.email}
Powered By ByteForge`;

    const botToken = company?.tg_bot_token;
    const chatId = company?.tg_chat_id?.toString();

    if (!botToken || !chatId) {
      alert("Telegram bot configuration missing for company.");
      return;
    }

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
          }),
        },
      );
      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.description || "Failed to send first message");
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
          }),
        },
      );
      const data2 = await response2.json();
      if (!data2.ok) {
        throw new Error(data2.description || "Failed to send second message");
      }
      alert("Quotation sent successfully to Telegram.");
    } catch (error) {
      console.error("Error sending message to Telegram:", error);
      alert("Failed to send message to Telegram.");
    }
  };

  const emptyForm = () => {
    reset(defaultValues);
    setResult(null);
    setSubmittedData(null);
    clearErrors();
  };

  const addItemToCart = () => {
    if (!result || !submittedData) {
      alert("Please calculate the item before adding it to the cart.");
      return;
    }

    const currentValues = validateCustomerFields();
    if (!currentValues) {
      return;
    }

    const item: CartItem = {
      id: Date.now().toString(),
      customerName: currentValues.customerName,
      customerPhone: currentValues.customerPhone,
      product: submittedData.calculationType === "1" ? "Book" : "Brochure",
      quantity: Number(submittedData.quantity),
      description: `Pages: ${submittedData.pages || "N/A"}, Paper Size: ${submittedData.paperSize}, Print Type: ${submittedData.printType || "2 Side"}, Color Inside: ${submittedData.colorInside}, Color Cover: ${submittedData.colorCover || "N/A"}`,
      totalCost: result.TotalCost.toFixed(2),
      singleItemCost: result.singleItemCost.toFixed(2),
      salesAgent: user?.name || "",
      companyName: company?.name || "",
      companyEmail: company?.email || "",
      createdAt: new Date().toISOString(),
    };

    dispatch(AddItem(item));
    alert("Item added to cart successfully.");
    emptyForm();
  };

  if (loading === false && user) {
    return (
      <div className="bg-slate-950 min-h-screen text-slate-100 antialiased font-sans">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 border-b border-slate-800 pb-5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Book & Brochure Estimator
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Paper rim calculation, page imposition, plate layout, lamination, and margin estimator.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onCalculate)}
            noValidate
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT COLUMN - FORM INPUT CARDS */}
              <div className="lg:col-span-2 space-y-6">
                {/* 1. JOB TYPE & QUANTITY */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="border-l-2 border-blue-500 pl-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      1. Product Selection & Volume
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      id="calculationType"
                      label="Calculation Type"
                      register={register}
                      error={errors.calculationType?.message}
                      options={[
                        { value: "1", label: "Book Calculation" },
                        { value: "2", label: "Brochure Calculation" },
                      ]}
                    />
                    <Input
                      id="quantity"
                      label="Print Quantity"
                      register={register}
                      error={errors.quantity?.message}
                      placeholder="e.g. 1000"
                    />
                  </div>
                </div>

                {/* 2. PAPER & SIZE SPECS */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="border-l-2 border-blue-500 pl-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      2. Paper Size & Inner Paper Specifications
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Select
                      id="paperSize"
                      label="Paper Size"
                      register={register}
                      error={errors.paperSize?.message}
                      options={[
                        { value: "A2", label: "A2" },
                        { value: "A3", label: "A3" },
                        { value: "A4", label: "A4" },
                        { value: "A5", label: "A5" },
                        { value: "A6", label: "A6" },
                        { value: "A7", label: "A7" },
                      ]}
                    />
                    <Select
                      id="rim"
                      label={
                        calculationType === "1"
                          ? "Inner Paper Grammage"
                          : "Brochure Paper Grammage"
                      }
                      register={register}
                      error={errors.rim?.message}
                      options={[
                        { value: "300", label: "300 Gram" },
                        { value: "250", label: "250 Gram" },
                        { value: "150", label: "150 Gram" },
                        { value: "100", label: "100 Gram" },
                        { value: "80", label: "80 Gram" },
                        { value: "60", label: "60 Gram" },
                      ]}
                    />
                    <Input
                      id="cost"
                      label={
                        calculationType === "1"
                          ? "Inner Paper Cost (ETB per Rim)"
                          : "Paper Cost (ETB per Rim)"
                      }
                      register={register}
                      error={errors.cost?.message}
                      placeholder="e.g. 2400"
                    />
                  </div>
                </div>

                {/* 3. BOOK COVER & PAGES SPECS (BOOK ONLY) */}
                {calculationType === "1" && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                    <div className="border-l-2 border-blue-500 pl-3">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                        3. Book Cover & Imposition Details
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        id="pages"
                        label="Pages (excluding cover)"
                        register={register}
                        error={errors.pages?.message}
                        placeholder="e.g. 120"
                      />
                      <Select
                        id="printType"
                        label="Print Type"
                        register={register}
                        error={errors.printType?.message}
                        options={[
                          { value: "1", label: "1 Side" },
                          { value: "2", label: "2 Side" },
                        ]}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                      <Select
                        id="coverRim"
                        label="Cover Paper Grammage"
                        register={register}
                        error={errors.coverRim?.message}
                        options={[
                          { value: "300", label: "300 Gram" },
                          { value: "250", label: "250 Gram" },
                          { value: "150", label: "150 Gram" },
                          { value: "100", label: "100 Gram" },
                          { value: "80", label: "80 Gram" },
                          { value: "60", label: "60 Gram" },
                          { value: "", label: "No Cover" },
                        ]}
                      />
                      <Input
                        id="coverCost"
                        label="Cover Paper Cost (ETB per Rim)"
                        register={register}
                        error={errors.coverCost?.message}
                        placeholder="e.g. 3200"
                      />
                    </div>
                  </div>
                )}

                {/* 4. COLOR PRINTING SPECS */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="border-l-2 border-blue-500 pl-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      4. Color Separations & Printing
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      id="colorInside"
                      label="Color for Inside Pages"
                      register={register}
                      error={errors.colorInside?.message}
                      options={[
                        { value: "1", label: "One Color" },
                        { value: "2", label: "Two Color" },
                        { value: "3", label: "Three Color" },
                        { value: "4", label: "Full Color" },
                      ]}
                    />
                    {calculationType === "1" && (
                      <Select
                        id="colorCover"
                        label="Color for Cover Pages"
                        register={register}
                        error={errors.colorCover?.message}
                        options={[
                          { value: "1", label: "One Color" },
                          { value: "2", label: "Two Color" },
                          { value: "3", label: "Three Color" },
                          { value: "4", label: "Full Color" },
                        ]}
                      />
                    )}
                  </div>
                </div>

                {/* 5. FINISHING, PLATE & OVERHEAD COSTS */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="border-l-2 border-blue-500 pl-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      5. Finishing, Plate & Profit Margins
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      id="plateCost"
                      label="Plate Unit Cost (ETB)"
                      register={register}
                      error={errors.plateCost?.message}
                      placeholder="e.g. 500"
                    />
                    <Input
                      id="laminationCost"
                      label="Lamination Cost (per unit)"
                      register={register}
                      error={errors.laminationCost?.message}
                      placeholder="e.g. 5"
                    />
                    {calculationType === "1" && (
                      <Input
                        id="perfectBindingCost"
                        label="Binding Cost (per unit)"
                        register={register}
                        error={errors.perfectBindingCost?.message}
                        placeholder="e.g. 15"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
                    <Input
                      id="wasteFactor"
                      label="Waste Factor (%)"
                      register={register}
                      error={errors.wasteFactor?.message}
                      placeholder="e.g. 5"
                    />
                    <Input
                      id="overAllCost"
                      label="Overhead Margin (%)"
                      register={register}
                      error={errors.overAllCost?.message}
                      placeholder="e.g. 10"
                    />
                    <Input
                      id="profitMargin"
                      label="Profit Margin (%)"
                      register={register}
                      error={errors.profitMargin?.message}
                      placeholder="e.g. 20"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                    <Input
                      id="otherOne"
                      label="Additional Direct Fee 1 (per unit)"
                      register={register}
                      error={errors.otherOne?.message}
                      placeholder="Optional"
                    />
                    <Input
                      id="otherTwo"
                      label="Additional Direct Fee 2 (per unit)"
                      register={register}
                      error={errors.otherTwo?.message}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-3 px-6 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    {isSubmitting
                      ? "Calculating..."
                      : calculationType === "1"
                        ? "Calculate Book Estimate"
                        : "Calculate Brochure Estimate"}
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN - BREAKDOWN SUMMARY */}
              <div className="space-y-6">
                {result ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-5 sticky top-20">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                        Cost Breakdown Summary
                      </h2>
                      <span className="text-[11px] font-mono bg-blue-950 text-blue-300 border border-blue-800/60 px-2 py-0.5 rounded">
                        CALCULATED
                      </span>
                    </div>

                    <div className="space-y-4 text-xs">
                      {/* TOTAL PRICE BANNER */}
                      <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg text-center space-y-1">
                        <span className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">
                          Total Estimate
                        </span>
                        <div className="text-2xl font-bold text-emerald-400 font-mono">
                          {result.TotalCost.toFixed(2)}{" "}
                          <span className="text-xs text-slate-400 font-normal">ETB</span>
                        </div>
                        <div className="text-xs text-slate-400 font-medium">
                          Single Unit Price:{" "}
                          <span className="text-white font-mono font-semibold">
                            {result.singleItemCost.toFixed(2)} ETB
                          </span>
                        </div>
                      </div>

                      {/* ITEM DETAILS */}
                      <div className="space-y-3 divide-y divide-slate-800/60">
                        <div className="pt-2 space-y-1">
                          <div className="flex justify-between font-medium text-slate-200">
                            <span>Paper Rims Required</span>
                            <span className="text-blue-400 font-mono">
                              {(
                                result.paperCost +
                                (calculationType === "1"
                                  ? result.coverCostTotal ?? 0
                                  : 0)
                              ).toFixed(2)}{" "}
                              ETB
                            </span>
                          </div>
                          <div>
                            Inside Paper Rims (with waste):{" "}
                            <span className="text-white font-mono">
                              {result.TotalPaperRims.toFixed(2)}
                            </span>
                          </div>
                          {calculationType === "1" && (
                            <div>
                              Cover Paper Rims (with waste):{" "}
                              <span className="text-white font-mono">
                                {result.TotalCoverResult?.toFixed(2) ?? "0.00"}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 space-y-1">
                          <div className="flex justify-between font-medium text-slate-200">
                            <span>Plates & Binding</span>
                            <span className="text-blue-400 font-mono">
                              {(
                                result.TotalPlateCost +
                                (calculationType === "1"
                                  ? result.PerfectBindingTotalCost ?? 0
                                  : 0)
                              ).toFixed(2)}{" "}
                              ETB
                            </span>
                          </div>
                          <div>
                            Total Plates:{" "}
                            <span className="text-white font-mono">
                              {result.TotalPlate.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            Plate Cost:{" "}
                            <span className="text-white font-mono">
                              {result.TotalPlateCost.toFixed(2)} ETB
                            </span>
                          </div>
                          {calculationType === "1" && (
                            <div>
                              Binding Cost:{" "}
                              <span className="text-white font-mono">
                                {result.PerfectBindingTotalCost?.toFixed(2) ?? "0.00"} ETB
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 space-y-1">
                          <div className="flex justify-between font-medium text-slate-200">
                            <span>Overhead & Profit</span>
                            <span className="text-blue-400 font-mono">
                              {(
                                result.OverAllCostAmount + result.ProfitMarginAmount
                              ).toFixed(2)}{" "}
                              ETB
                            </span>
                          </div>
                          <div>
                            Overhead Margin:{" "}
                            <span className="text-white font-mono">
                              {result.OverAllCostAmount.toFixed(2)} ETB
                            </span>
                          </div>
                          <div>
                            Profit Margin:{" "}
                            <span className="text-white font-mono">
                              {result.ProfitMarginAmount.toFixed(2)} ETB
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* CUSTOMER INPUTS */}
                      <div className="pt-4 border-t border-slate-800 space-y-3">
                        <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                          Customer Information
                        </div>
                        <Input
                          id="customerName"
                          label="Customer / Company Name"
                          register={register}
                          error={errors.customerName?.message}
                          type="text"
                          placeholder="Client name"
                        />
                        <Input
                          id="customerPhone"
                          label="Customer Phone Number"
                          register={register}
                          error={errors.customerPhone?.message}
                          type="text"
                          placeholder="09..."
                        />
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="pt-3 space-y-2">
                        <button
                          type="button"
                          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold py-2.5 px-4 rounded-lg border border-slate-700 transition-colors"
                          onClick={addItemToCart}
                        >
                          Add to Quotation Cart
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 px-3 rounded-lg transition-colors"
                            onClick={sendToTelegram}
                          >
                            Send Telegram
                          </button>
                          <button
                            type="button"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2.5 px-3 rounded-lg transition-colors"
                            onClick={GeneratePdfData}
                          >
                            PDF Quotation
                          </button>
                        </div>

                        <button
                          type="button"
                          className="w-full bg-slate-950 hover:bg-rose-950/40 text-rose-400 text-xs font-medium py-2 px-4 rounded-lg border border-rose-900/30 transition-colors"
                          onClick={emptyForm}
                        >
                          Clear Form
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-3 sticky top-20">
                    <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-sm font-bold border border-slate-700">
                      !
                    </div>
                    <h3 className="text-sm font-semibold text-slate-200">
                      No Calculation Generated
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Fill out the quantity and paper details on the left, then click &quot;Calculate Estimate&quot;.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-slate-950">
      <Image src={Loading} alt="Loading" className="animate-spin w-10 opacity-80" />
    </div>
  );
}

type InputProps = {
  id: keyof CalculatorFormData;
  label: string;
  register: UseFormRegister<CalculatorFormData>;
  error?: string;
  type?: string;
  placeholder?: string;
};

function Input({
  id,
  label,
  register,
  error,
  type = "number",
  placeholder,
}: InputProps) {
  return (
    <div className="w-full space-y-1">
      <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
        {label}
      </label>
      <input
        id={id}
        type={type}
        step="any"
        placeholder={placeholder}
        {...register(id)}
        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
        aria-invalid={Boolean(error)}
      />
      {error && <p className="text-[11px] text-rose-400">{error}</p>}
    </div>
  );
}

type SelectProps = {
  id: keyof CalculatorFormData;
  label: string;
  register: UseFormRegister<CalculatorFormData>;
  error?: string;
  options: Array<{ value: string; label: string }>;
};

function Select({ id, label, register, error, options }: SelectProps) {
  return (
    <div className="w-full space-y-1">
      <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
        {label}
      </label>
      <select
        id={id}
        {...register(id)}
        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
        aria-invalid={Boolean(error)}
      >
        {options.map((opt) => (
          <option key={`${opt.value}-${opt.label}`} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-[11px] text-rose-400">{error}</p>}
    </div>
  );
}
