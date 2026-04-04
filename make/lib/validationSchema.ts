import { z } from "zod";

const requiredPositiveInteger = (message: string) =>
  z
    .string()
    .min(1, message)
    .refine((value) => {
      const numberValue = Number(value);
      return Number.isInteger(numberValue) && numberValue > 0;
    }, message);

const requiredNonNegativeNumber = (message: string) =>
  z
    .string()
    .min(1, message)
    .refine((value) => {
      const numberValue = Number(value);
      return Number.isFinite(numberValue) && numberValue >= 0;
    }, message);

const optionalNonNegativeNumber = (message: string) =>
  z.string().refine((value) => {
    if (value === "") {
      return true;
    }

    const numberValue = Number(value);
    return Number.isFinite(numberValue) && numberValue >= 0;
  }, message);

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "password must be atleast 6 characters")
    .regex(/[A-Z]/, "Password must have atleast one Uppercase letter")
    .regex(/[a-z]/, "Password must have atleast one Lowercase letter")
    .regex(/[0-9]/, "Password must atleast have one number")
    .regex(/^[a-zA-Z0-9]/, "Password must have atleast one Special character"),
  companyId: z.string().uuid("Invalid company ID"),
});

export const loginUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const loginAdminSchema = z.object({
  username: z.string().min(3, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const calculatorSchema = z
  .object({
    calculationType: z.enum(["1", "2"]),
    pages: z.string().optional(),
    quantity: requiredPositiveInteger("Quantity is required"),
    paperSize: z.enum(["A2", "A3", "A4", "A5", "A6", "A7"]),
    rim: z.enum(["300", "250", "150", "100", "80", "60"]),
    coverRim: z.string().optional(),
    printType: z.string().optional(),
    cost: requiredNonNegativeNumber("Inner paper cost is required"),
    coverCost: optionalNonNegativeNumber(
      "Cover paper cost must be a valid number",
    ),
    laminationCost: optionalNonNegativeNumber(
      "Lamination cost must be a valid number",
    ),
    perfectBindingCost: optionalNonNegativeNumber(
      "Binding cost must be a valid number",
    ),
    wasteFactor: requiredNonNegativeNumber("Waste factor is required"),
    plateCost: requiredNonNegativeNumber("Plate cost is required"),
    overAllCost: requiredNonNegativeNumber("Overall cost is required"),
    profitMargin: requiredNonNegativeNumber("Profit margin is required"),
    colorCover: z.string().optional(),
    colorInside: z.enum(["1", "2", "3", "4"]),
    otherOne: z.string().optional(),
    otherTwo: z.string().optional(),
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.calculationType !== "1") {
      return;
    }

    const numberRules = [
      {
        value: values.pages,
        path: ["pages"],
        message: "Pages without cover is required",
        validator: (input: string) => {
          const numberValue = Number(input);
          return Number.isInteger(numberValue) && numberValue > 0;
        },
      },
    ] as const;

    for (const rule of numberRules) {
      if (!rule.value || !rule.validator(rule.value)) {
        ctx.addIssue({
          code: "custom",
          path: [...rule.path],
          message: rule.message,
        });
      }
    }

    if (!values.printType) {
      ctx.addIssue({
        code: "custom",
        path: ["printType"],
        message: "Print type is required",
      });
    }
  });

export const customerDetailsSchema = z.object({
  customerName: z.string().min(1, "Customer/Company name is required"),
  customerPhone: z.string().min(1, "Customer/Company phone is required"),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .optional(),
});

export const createCompanySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  username: z.string().min(3, "Username is required"),
  tg_bot_token: z
    .string()
    .min(10, "Telegram bot token must be at least 10 characters long"),
  tg_chat_id: z
    .number()
    .min(12, "Telegram chat ID must be 12 numbers long")
    .max(12, "Telegram chat ID must be 12 numbers long"),
});
