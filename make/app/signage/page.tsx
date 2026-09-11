"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/state/store";
import { getCompanyDataAsync } from "@/state/API/ApiSlice";
import { AddItem, type CartItem } from "@/state/cart/cartSlice";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Loading from "@/public/loginIcons/loading.png";
import Navigation from "@/components/navigation";
import { z } from "zod";
import { useForm, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  signageCalculatorSchema,
  customerDetailsSchema,
} from "@/lib/validationSchema";

type SignageFormData = z.infer<typeof signageCalculatorSchema>;

type SignageCalculationResult = {
  orientedWidth: number;
  orientedHeight: number;
  acpHeightUsed: number;
  acpRequiredSheets: number;
  acpMaterialDescription: string;
  acpWidthWaste: number;
  acpHeightWaste: number;
  acpTotalCost: number;
  acrylicRequiredSheets: number;
  acrylicTotalCost: number;
  outerFrameRhs: number;
  verticalSupports: number;
  horizontalSupports: number;
  totalRhsLength: number;
  rhsPieces: number;
  rhsTotalCost: number;
  perimeter: number;
  zekoloCost: number;
  powerSupplyCost: number;
  ledCost: number;
  totalCost: number;
};

const defaultValues: SignageFormData = {
  lightboxWidth: "",
  lightboxHeight: "",
  acpPrice: "",
  acrylicWidth: "",
  acrylicHeight: "",
  acrylicPrice: "",
  perimeter: "",
  zekoloSize: "",
  zekoloPrice: "",
  powerSupplyCount: "",
  powerSupplyPrice: "",
  ledCount: "",
  ledPrice: "",
  rhsPrice: "",
  customerName: "",
  customerPhone: "",
};

export default function SignagePage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, company, loading, initialized } = useSelector(
    (state: RootState) => state.api,
  );
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const [result, setResult] = useState<SignageCalculationResult | null>(null);
  const [submittedData, setSubmittedData] = useState<SignageFormData | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    getValues,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignageFormData>({
    resolver: zodResolver(signageCalculatorSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues,
  });

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

  const calculateSignage = (data: SignageFormData) => {
    const rawW = Number(data.lightboxWidth);
    const rawH = Number(data.lightboxHeight);

    const orientedWidth = Math.max(rawW, rawH);
    const orientedHeight = Math.min(rawW, rawH);

    let acpHeightUsed = orientedHeight;
    if (orientedHeight >= 0.90 && orientedHeight <= 1.22) {
      acpHeightUsed = 1.22;
    } else if (orientedHeight > 1.22) {
      const fullRows = Math.floor(orientedHeight / 1.22);
      const remH = orientedHeight - fullRows * 1.22;
      if (remH >= 0.90 && remH <= 1.22) {
        acpHeightUsed = fullRows * 1.22 + 1.22;
      } else {
        acpHeightUsed = orientedHeight;
      }
    }

    const acpMaterialArea = orientedWidth * acpHeightUsed;
    const acpRequiredSheets = acpMaterialArea / (2.44 * 1.22);
    const acpPrice = Number(data.acpPrice || 0);
    const acpTotalCost = acpRequiredSheets * acpPrice;

    let acpMaterialDescription = "";
    if (orientedWidth > 2.44) {
      const fullWidths = Math.floor(orientedWidth / 2.44);
      const remWidth = orientedWidth - fullWidths * 2.44;
      if (remWidth > 0) {
        acpMaterialDescription = `${fullWidths} full ACP + ${remWidth.toFixed(
          2,
        )}m × ${acpHeightUsed.toFixed(2)}m from a 3rd ACP`;
      } else {
        acpMaterialDescription = `${fullWidths} full ACP (${orientedWidth.toFixed(
          2,
        )}m × ${acpHeightUsed.toFixed(2)}m)`;
      }
    } else {
      acpMaterialDescription = `1 ACP sheet (${orientedWidth.toFixed(
        2,
      )}m × ${acpHeightUsed.toFixed(2)}m used)`;
    }

    const widthSheetsNeeded = Math.ceil(orientedWidth / 2.44);
    const acpWidthWaste = widthSheetsNeeded * 2.44 - orientedWidth;
    const heightRowsNeeded = Math.ceil(orientedHeight / 1.22);
    const acpHeightWaste = heightRowsNeeded * 1.22 - orientedHeight;

    const acrW_raw = Number(data.acrylicWidth || 0);
    const acrH_raw = Number(data.acrylicHeight || 0);
    const acrPrice = Number(data.acrylicPrice || 0);
    let acrylicRequiredSheets = 0;
    let acrylicTotalCost = 0;

    if (acrW_raw > 0 && acrH_raw > 0) {
      const acrW = Math.max(acrW_raw, acrH_raw);
      const acrH = Math.min(acrW_raw, acrH_raw);
      let acrH_used = acrH;
      if (acrH >= 0.90 && acrH <= 1.22) {
        acrH_used = 1.22;
      } else if (acrH > 1.22) {
        const fullRows = Math.floor(acrH / 1.22);
        const remH = acrH - fullRows * 1.22;
        if (remH >= 0.90 && remH <= 1.22) {
          acrH_used = fullRows * 1.22 + 1.22;
        }
      }
      const acrArea = acrW * acrH_used;
      acrylicRequiredSheets = acrArea / (2.44 * 1.22);
      acrylicTotalCost = acrylicRequiredSheets * acrPrice;
    }

    const outerFrameRhs = 2 * rawW + 2 * rawH;
    const verticalSupports = Math.max(0, Math.floor(orientedWidth / 1.5) - 1);
    const horizontalSupports = Math.max(
      0,
      Math.floor(orientedHeight / 1.5) - 1,
    );

    const verticalRhsLength = verticalSupports * orientedHeight;
    const horizontalRhsLength = horizontalSupports * orientedWidth;

    const totalRhsLength =
      outerFrameRhs + verticalRhsLength + horizontalRhsLength;
    const rhsPieces = totalRhsLength / 6;
    const rhsPrice = Number(data.rhsPrice || 0);
    const rhsTotalCost = rhsPieces * rhsPrice;

    const perimeter =
      Number(data.perimeter) > 0
        ? Number(data.perimeter)
        : 2 * rawW + 2 * rawH;
    const zekoloSize = Number(data.zekoloSize || 0);
    const zekoloPrice = Number(data.zekoloPrice || 0);
    let zekoloCost = 0;
    if (zekoloSize > 0 && zekoloPrice > 0) {
      const pricePerMeter = zekoloPrice / zekoloSize;
      zekoloCost = pricePerMeter * perimeter;
    }

    const powerSupplyCount = Number(data.powerSupplyCount || 0);
    const powerSupplyPrice = Number(data.powerSupplyPrice || 0);
    const powerSupplyCost = powerSupplyCount * powerSupplyPrice;

    const ledCount = Number(data.ledCount || 0);
    const ledPrice = Number(data.ledPrice || 0);
    const ledCost = ledCount * ledPrice;

    const totalCost =
      acpTotalCost +
      acrylicTotalCost +
      rhsTotalCost +
      zekoloCost +
      powerSupplyCost +
      ledCost;

    setResult({
      orientedWidth,
      orientedHeight,
      acpHeightUsed,
      acpRequiredSheets,
      acpMaterialDescription,
      acpWidthWaste,
      acpHeightWaste,
      acpTotalCost,
      acrylicRequiredSheets,
      acrylicTotalCost,
      outerFrameRhs,
      verticalSupports,
      horizontalSupports,
      totalRhsLength,
      rhsPieces,
      rhsTotalCost,
      perimeter,
      zekoloCost,
      powerSupplyCost,
      ledCost,
      totalCost,
    });
    setSubmittedData(data);
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

  const emptyForm = () => {
    reset(defaultValues);
    setResult(null);
    setSubmittedData(null);
    clearErrors();
  };

  const createCartItemObj = (
    currentValues: { customerName: string; customerPhone: string },
    calcResult: SignageCalculationResult,
    formData: SignageFormData,
  ): CartItem => {
    return {
      id: Date.now().toString(),
      customerName: currentValues.customerName,
      customerPhone: currentValues.customerPhone,
      product: "Signage",
      quantity: 1,
      description: `Size: ${calcResult.orientedWidth}m × ${calcResult.orientedHeight}m | ACP: ${calcResult.acpTotalCost.toFixed(2)} ETB | RHS: ${calcResult.rhsTotalCost.toFixed(2)} ETB | Acrylic: ${calcResult.acrylicTotalCost.toFixed(2)} ETB | Zekolo: ${calcResult.zekoloCost.toFixed(2)} ETB | Power: ${calcResult.powerSupplyCost.toFixed(2)} ETB | LED: ${calcResult.ledCost.toFixed(2)} ETB`,
      totalCost: calcResult.totalCost.toFixed(2),
      singleItemCost: calcResult.totalCost.toFixed(2),
      salesAgent: user?.name || "",
      companyName: company?.name || "",
      companyEmail: company?.email || "",
      createdAt: new Date().toISOString(),
    };
  };

  const addItemToCart = () => {
    if (!result || !submittedData) {
      alert("Please calculate the signage job before adding to cart.");
      return;
    }

    const currentValues = validateCustomerFields();
    if (!currentValues) {
      return;
    }

    const item = createCartItemObj(currentValues, result, submittedData);
    dispatch(AddItem(item));

    alert("Item added to cart successfully.");
    emptyForm();
  };

  const GeneratePdfData = () => {
    if (!result || !submittedData) {
      if (!cartItems.length) {
        alert("Please calculate a signage job or add items to cart first.");
        return;
      }
      router.push("/pdf");
      return;
    }

    const currentValues = validateCustomerFields();
    if (!currentValues) {
      return;
    }

    const item = createCartItemObj(currentValues, result, submittedData);
    dispatch(AddItem(item));
    router.push("/pdf");
  };

  const sendToTelegram = async () => {
    if (!result || !submittedData) {
      alert("Please calculate the signage job before sending to Telegram.");
      return;
    }

    const currentValues = validateCustomerFields();
    if (!currentValues) {
      return;
    }

    const staffMessage = `SERVICE REQUEST (Internal Copy)

Customer: ${currentValues.customerName}
Phone: ${currentValues.customerPhone}

Specification: Signage / Lightbox
Lightbox Dimensions: ${result.orientedWidth}m × ${result.orientedHeight}m
ACP Material: ${result.acpRequiredSheets.toFixed(2)} sheets (${result.acpMaterialDescription}) - ${result.acpTotalCost.toFixed(2)} ETB
ACP Waste: Width ${result.acpWidthWaste.toFixed(2)}m | Height ${result.acpHeightWaste.toFixed(2)}m
Acrylic Material: ${result.acrylicRequiredSheets.toFixed(2)} sheets - ${result.acrylicTotalCost.toFixed(2)} ETB
Perimeter: ${result.perimeter}m
Letter Edge (Zekolo) Cost: ${result.zekoloCost.toFixed(2)} ETB
Power Supply Cost: ${result.powerSupplyCost.toFixed(2)} ETB
LED Cost: ${result.ledCost.toFixed(2)} ETB
Frame RHS: ${result.totalRhsLength.toFixed(2)}m (${result.rhsPieces.toFixed(2)} pcs of 6m) - ${result.rhsTotalCost.toFixed(2)} ETB

TOTAL PRICE: ${result.totalCost.toFixed(2)} ETB

Date: ${new Date().toLocaleString()}
Sales Agent: ${user?.name}

${company?.name}
${company?.email}
Powered By ByteForge`;

    const customerMessage = `SERVICE REQUEST

Customer: ${currentValues.customerName}
Phone: ${currentValues.customerPhone}

Product: Signage / Lightbox
Dimensions: ${result.orientedWidth}m × ${result.orientedHeight}m

TOTAL ESTIMATE: ${result.totalCost.toFixed(2)} ETB

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
            text: staffMessage,
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
            text: customerMessage,
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

  if (loading === false && user) {
    return (
      <div className="bg-slate-950 min-h-screen text-slate-100 antialiased font-sans">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 border-b border-slate-800 pb-5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Signage & Lightbox Estimator
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Material estimation, RHS frame structure, letter trim, and LED power calculator.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(calculateSignage)}
            noValidate
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT & MIDDLE COLUMN - INPUT CARDS */}
              <div className="lg:col-span-2 space-y-6">
                {/* 1. LIGHTBOX & ACP SPECS */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="border-l-2 border-blue-500 pl-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      1. Lightbox Dimensions & ACP Board
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Standard sheet dimensions: 2.44m × 1.22m. Auto-orients portrait inputs.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      id="lightboxWidth"
                      label="Width (m)"
                      register={register}
                      error={errors.lightboxWidth?.message}
                      placeholder="e.g. 5.50"
                    />
                    <Input
                      id="lightboxHeight"
                      label="Height (m)"
                      register={register}
                      error={errors.lightboxHeight?.message}
                      placeholder="e.g. 1.00"
                    />
                    <Input
                      id="acpPrice"
                      label="ACP Sheet Price (ETB)"
                      register={register}
                      error={errors.acpPrice?.message}
                      placeholder="e.g. 3500"
                    />
                  </div>
                </div>

                {/* 2. ACRYLIC SPECS */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="border-l-2 border-blue-500 pl-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      2. Acrylic Face Board
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Enter acrylic dimensions and standard sheet unit price.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      id="acrylicWidth"
                      label="Acrylic Width (m)"
                      register={register}
                      error={errors.acrylicWidth?.message}
                      placeholder="e.g. 2.00"
                    />
                    <Input
                      id="acrylicHeight"
                      label="Acrylic Height (m)"
                      register={register}
                      error={errors.acrylicHeight?.message}
                      placeholder="e.g. 1.00"
                    />
                    <Input
                      id="acrylicPrice"
                      label="Acrylic Sheet Price (ETB)"
                      register={register}
                      error={errors.acrylicPrice?.message}
                      placeholder="e.g. 4500"
                    />
                  </div>
                </div>

                {/* 3. RHS FRAME & LETTER TRIM */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="border-l-2 border-blue-500 pl-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      3. Frame RHS & Letter Trim (Zekolo)
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      RHS pieces are 6m long. Supports placed dynamically at max 1.50m spacing.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      id="rhsPrice"
                      label="RHS Price per 6m Piece (ETB)"
                      register={register}
                      error={errors.rhsPrice?.message}
                      placeholder="e.g. 1800"
                    />
                    <Input
                      id="perimeter"
                      label="Perimeter (m - optional)"
                      register={register}
                      error={errors.perimeter?.message}
                      placeholder="Defaults to 2W + 2H"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                    <Input
                      id="zekoloSize"
                      label="Zekolo Roll Size (m)"
                      register={register}
                      error={errors.zekoloSize?.message}
                      placeholder="e.g. 10"
                    />
                    <Input
                      id="zekoloPrice"
                      label="Zekolo Roll Price (ETB)"
                      register={register}
                      error={errors.zekoloPrice?.message}
                      placeholder="e.g. 5000"
                    />
                  </div>
                </div>

                {/* 4. ELECTRICAL & LIGHTING */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="border-l-2 border-blue-500 pl-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      4. Power Supply & LED Lighting
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Count and unit prices for power supply units and LED modules.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      id="powerSupplyCount"
                      label="Power Supply Count"
                      register={register}
                      error={errors.powerSupplyCount?.message}
                      placeholder="e.g. 2"
                    />
                    <Input
                      id="powerSupplyPrice"
                      label="Power Supply Unit Price (ETB)"
                      register={register}
                      error={errors.powerSupplyPrice?.message}
                      placeholder="e.g. 1200"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      id="ledCount"
                      label="LED Module Count"
                      register={register}
                      error={errors.ledCount?.message}
                      placeholder="e.g. 150"
                    />
                    <Input
                      id="ledPrice"
                      label="LED Module Unit Price (ETB)"
                      register={register}
                      error={errors.ledPrice?.message}
                      placeholder="e.g. 35"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-3 px-6 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    {isSubmitting ? "Calculating Engine..." : "Calculate Signage Estimate"}
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
                          {result.totalCost.toFixed(2)}{" "}
                          <span className="text-xs text-slate-400 font-normal">ETB</span>
                        </div>
                      </div>

                      {/* ITEM DETAILS */}
                      <div className="space-y-3 divide-y divide-slate-800/60">
                        <div className="pt-2 space-y-1">
                          <div className="flex justify-between font-medium text-slate-200">
                            <span>ACP Sheet Material</span>
                            <span className="text-blue-400 font-mono">
                              {result.acpTotalCost.toFixed(2)} ETB
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Required: {result.acpRequiredSheets.toFixed(2)} sheets
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {result.acpMaterialDescription}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Waste: W {result.acpWidthWaste.toFixed(2)}m | H{" "}
                            {result.acpHeightWaste.toFixed(2)}m
                          </p>
                        </div>

                        <div className="pt-2 space-y-1">
                          <div className="flex justify-between font-medium text-slate-200">
                            <span>Acrylic Board</span>
                            <span className="text-blue-400 font-mono">
                              {result.acrylicTotalCost.toFixed(2)} ETB
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Required: {result.acrylicRequiredSheets.toFixed(2)} sheets
                          </p>
                        </div>

                        <div className="pt-2 space-y-1">
                          <div className="flex justify-between font-medium text-slate-200">
                            <span>Frame RHS Structure</span>
                            <span className="text-blue-400 font-mono">
                              {result.rhsTotalCost.toFixed(2)} ETB
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Total Length: {result.totalRhsLength.toFixed(2)}m (
                            {result.rhsPieces.toFixed(2)} pcs of 6m)
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Supports: {result.verticalSupports} Vert / {result.horizontalSupports} Horiz
                          </p>
                        </div>

                        <div className="pt-2 space-y-1">
                          <div className="flex justify-between font-medium text-slate-200">
                            <span>Letter Edge (Zekolo)</span>
                            <span className="text-blue-400 font-mono">
                              {result.zekoloCost.toFixed(2)} ETB
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Perimeter: {result.perimeter}m
                          </p>
                        </div>

                        <div className="pt-2 space-y-1">
                          <div className="flex justify-between font-medium text-slate-200">
                            <span>Power Supply & LED</span>
                            <span className="text-blue-400 font-mono">
                              {(result.powerSupplyCost + result.ledCost).toFixed(2)} ETB
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Power Supply: {result.powerSupplyCost.toFixed(2)} ETB | LED:{" "}
                            {result.ledCost.toFixed(2)} ETB
                          </p>
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
                      Fill out the lightbox dimensions and component prices on the left, then click &quot;Calculate Signage Estimate&quot;.
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
  id: keyof SignageFormData;
  label: string;
  register: UseFormRegister<SignageFormData>;
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
