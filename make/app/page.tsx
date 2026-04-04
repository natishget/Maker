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
    if (!cartItems.length) {
      alert("Cart is empty. Add at least one item before generating PDF.");
      return;
    }

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

    const secondMessage = `📄 Service Request

👤 Customer: ${currentValues.customerName}
📞 Phone: ${currentValues.customerPhone}

📦 Type: ${submittedData.calculationType === "1" ? "Book Related" : "Brochure Related"}
${submittedData.calculationType === "1" ? `📑 Pages: ${submittedData.pages}` : ""}
🔢 Quantity: ${submittedData.quantity}

💰 Total Cost: *\`${result.TotalCost.toFixed(2)}\`*
💵 Single Item Cost: *\`${result.singleItemCost.toFixed(2)}\`*



📅 Date: ${new Date().toLocaleString()}
🧑 Sales Agent: ${user?.name}


${company?.name}
${company?.email}
Powered By ByteForge 🚀`;

    const message = `📄 Service Request (staff only)👆

👤 Customer: ${currentValues.customerName}
📞 Phone: ${currentValues.customerPhone}

📦 Type: ${submittedData.calculationType === "1" ? "Book Related" : "Brochure Related"}
${submittedData.calculationType === "1" ? `📑 Pages: ${submittedData.pages}` : ""}
🔢 Quantity: ${submittedData.quantity}
📖 Inside paper per rim: ${submittedData.rim}
💰 Rim cost: ${submittedData.cost}
${
  submittedData.calculationType === "1"
    ? `📕 Cover paper per rim: ${submittedData.coverRim}
💰 Cover rim cost: ${submittedData.coverCost}
🎨 Color for inside: ${submittedData.colorInside}
🎨 Color for cover: ${submittedData.colorCover}`
    : ""
}
📄 Print size: ${submittedData.paperSize}
🖨️ Print type: ${submittedData.printType === "1" ? "1 Side" : "2 Side"}
🖥️ Plate cost: ${submittedData.plateCost}
📑 Lamination cost: ${submittedData.laminationCost}
${submittedData.calculationType === "1" ? `📎 Binding cost: ${submittedData.perfectBindingCost}` : ""}
🗑️ Waste factor: ${submittedData.wasteFactor}%
📈 Overall cost: ${submittedData.overAllCost}%
📊 Profit margin: ${submittedData.profitMargin}%


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
            parse_mode: "Markdown",
          }),
        },
      );
      const data2 = await response2.json();
      if (!data2.ok) {
        throw new Error(data2.description || "Failed to send second message");
      }
      alert("Message sent successfully!");
    } catch (error) {
      console.error("Error sending message to Telegram:", error);
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
      description: `Pages: ${submittedData.pages}, Paper Size: ${submittedData.paperSize}, Print Type: ${submittedData.printType}, Color Inside: ${submittedData.colorInside}, Color Cover: ${submittedData.colorCover}`,
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
          <form
            onSubmit={handleSubmit(onCalculate)}
            noValidate
            className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl space-y-4 overflow-y-auto no-scrollbar"
          >
            <h2 className="text-xl font-bold text-center">
              {calculationType === "1"
                ? "Book Calculator"
                : "Brochure Calculator"}
            </h2>

            <Select
              id="calculationType"
              label="Calculation For"
              register={register}
              error={errors.calculationType?.message}
              options={[
                { value: "1", label: "Book" },
                { value: "2", label: "Brochures" },
              ]}
            />

            <div className={calculationType === "1" ? "" : "hidden"}>
              <Input
                id="pages"
                label="Pages without cover"
                register={register}
                error={errors.pages?.message}
              />
            </div>

            <Input
              id="quantity"
              label="Quantity"
              register={register}
              error={errors.quantity?.message}
            />

            <div className={calculationType === "1" ? "" : "hidden"}>
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

            <Select
              id="paperSize"
              label="Paper Size (A2, A3, ..)"
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
                  ? "Inner Paper Thickness (80 Gram, 100 Gram,...)"
                  : "Brochure Paper Thickness (150 Gram, 200 Gram,...)"
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
                  ? "Inner Paper Cost ($ per Rim)"
                  : "Brochure Paper Cost ($ per Rim)"
              }
              register={register}
              error={errors.cost?.message}
            />

            <div className={calculationType === "1" ? "" : "hidden"}>
              <Select
                id="coverRim"
                label="Cover Paper Thickness (150 Gram, 200 Gram,...)"
                register={register}
                error={errors.coverRim?.message}
                options={[
                  { value: "300", label: "300 Gram" },
                  { value: "250", label: "250 Gram" },
                  { value: "150", label: "150 Gram" },
                  { value: "100", label: "100 Gram" },
                  { value: "80", label: "80 Gram" },
                  { value: "60", label: "60 Gram" },
                  { value: "", label: "Do Not Use Cover" },
                ]}
              />
              <Input
                id="coverCost"
                label="Cover Paper Cost ($ per Rim)"
                register={register}
                error={errors.coverCost?.message}
              />
            </div>

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

            <div className={calculationType === "1" ? "" : "hidden"}>
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
            </div>

            <Input
              id="plateCost"
              label="Plate Cost"
              register={register}
              error={errors.plateCost?.message}
            />

            <Input
              id="laminationCost"
              label="Lamination Cost"
              register={register}
              error={errors.laminationCost?.message}
            />

            <div className={calculationType === "1" ? "" : "hidden"}>
              <Input
                id="perfectBindingCost"
                label="Binding Cost"
                register={register}
                error={errors.perfectBindingCost?.message}
              />
            </div>

            <Input
              id="wasteFactor"
              label="Waste Factor %"
              register={register}
              error={errors.wasteFactor?.message}
            />

            <Input
              id="overAllCost"
              label="Overall Cost %"
              register={register}
              error={errors.overAllCost?.message}
            />

            <Input
              id="profitMargin"
              label="Profit Margin %"
              register={register}
              error={errors.profitMargin?.message}
            />

            <Input
              id="otherOne"
              label="Other One (will be Directly added)"
              register={register}
              error={errors.otherOne?.message}
            />

            <Input
              id="otherTwo"
              label="Other Two (will be Directly added)"
              register={register}
              error={errors.otherTwo?.message}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Calculating..." : "Calculate"}
            </button>

            {result && (
              <div className="space-y-1 text-sm font-semibold">
                <div className="flex justify-evenly">
                  <div className="border-r border-gray-400 pr-3">
                    <div className="text-blue-600">Required Rims</div>
                    <div className={calculationType === "1" ? "" : "hidden"}>
                      For Inside: {result.resultPaper?.toFixed(2)}
                    </div>
                    <div className={calculationType === "1" ? "" : "hidden"}>
                      For Cover: {result.CoverPageResult?.toFixed(2)}
                    </div>

                    <div className="text-blue-600">
                      Required Rim{" "}
                      <span className="text-red-600">with Waste</span>
                    </div>
                    <div>For Inside: {result.TotalPaperRims.toFixed(2)}</div>

                    <div className={calculationType === "1" ? "" : "hidden"}>
                      For Cover: {result.TotalCoverResult?.toFixed(2)}
                    </div>

                    <div>
                      Cost for Inside: {Number(result.paperCost.toFixed(2))}
                    </div>
                    <div className={calculationType === "1" ? "" : "hidden"}>
                      Cost for Cover: {result.coverCostTotal?.toFixed(2)}
                    </div>

                    <div className="text-yellow-600">
                      Total Paper Cost:{" "}
                      {Number(result.paperCost.toFixed(2)) +
                        Number(
                          calculationType === "1"
                            ? (result.coverCostTotal?.toFixed(2) ?? 0)
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
                    </div>
                    <br />
                    <div className={calculationType === "1" ? "" : "hidden"}>
                      Total Binding Cost:{" "}
                      {result.PerfectBindingTotalCost?.toFixed(2)}
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
                    register={register}
                    error={errors.customerName?.message}
                    type="text"
                  />
                  <Input
                    id="customerPhone"
                    label="Customer/Company Phone"
                    register={register}
                    error={errors.customerPhone?.message}
                    type="text"
                  />
                </div>

                <div className="flex justify-between gap-2 flex-wrap">
                  <button
                    type="button"
                    className="bg-purple-600 text-white font-sm px-3 py-2 rounded"
                    onClick={addItemToCart}
                  >
                    Add To Cart
                  </button>
                  <button
                    type="button"
                    className="bg-blue-600 text-white font-sm px-3 py-2 rounded"
                    onClick={sendToTelegram}
                  >
                    Send To Telegram
                  </button>
                  <button
                    type="button"
                    className="bg-green-500 text-white font-sm px-3 py-2 rounded"
                    onClick={GeneratePdfData}
                  >
                    PDF
                  </button>
                  <button
                    type="button"
                    className="bg-red-600 text-white font-sm px-3 py-2 rounded"
                    onClick={emptyForm}
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </form>
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

type InputProps = {
  id: keyof CalculatorFormData;
  label: string;
  register: UseFormRegister<CalculatorFormData>;
  error?: string;
  type?: string;
};

function Input({ id, label, register, error, type = "number" }: InputProps) {
  return (
    <div>
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
      <input
        id={id}
        type={type}
        {...register(id)}
        className="w-full border p-2 rounded mt-1"
        aria-invalid={Boolean(error)}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
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
    <div>
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
      <select
        id={id}
        {...register(id)}
        className="w-full border p-2 rounded mt-1"
        aria-invalid={Boolean(error)}
      >
        {options.map((opt) => (
          <option key={`${opt.value}-${opt.label}`} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
