"use client";

import React, { useEffect, useState } from "react";
import { Button, Dialog, Flex, Text, TextField } from "@radix-ui/themes";
import { useDispatch } from "react-redux";
import { Pencil } from "lucide-react";
import { z } from "zod";
import { editCompanyAsync, type Company } from "@/state/API/ApiSlice";
import type { AppDispatch } from "@/state/store";
import CustomAlert from "@/components/alert";

type CompanyFormData = {
  id: string;
  name: string;
  email: string;
  tg_bot_token: string;
  tg_chat_id: string;
};

type CompanyWithAliases = Company & {
  tgBotToken?: string;
  tgChatId?: number | string;
};

type FormErrors = Partial<Record<keyof CompanyFormData, string>>;

const editCompanySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  email: z.string().email("Invalid email address"),
  tg_bot_token: z.string().min(1, "Telegram bot token is required"),
  tg_chat_id: z
    .string()
    .min(1, "Telegram chat ID is required")
    .regex(/^-?\d+$/, "Telegram chat ID must be a number"),
});

const getInitialCompanyData = (companyInfo: Company): CompanyFormData => {
  const normalizedCompany = companyInfo as CompanyWithAliases;
  const normalizedChatId =
    normalizedCompany.tg_chat_id ?? normalizedCompany.tgChatId;

  return {
    id: companyInfo.id,
    name: companyInfo.name,
    email: companyInfo.email,
    tg_bot_token:
      normalizedCompany.tg_bot_token || normalizedCompany.tgBotToken || "",
    tg_chat_id:
      normalizedChatId === undefined || normalizedChatId === null
        ? ""
        : String(normalizedChatId),
  };
};

const DialogForCompanyEdit = ({ companyInfo }: { companyInfo: Company }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<CompanyFormData>(
    getInitialCompanyData(companyInfo),
  );

  useEffect(() => {
    setFormData(getInitialCompanyData(companyInfo));
  }, [companyInfo]);

  useEffect(() => {
    if (!submitSuccess) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setSubmitSuccess(null);
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [submitSuccess]);

  const handleChange = (field: keyof CompanyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setSubmitError(null);
      setSubmitSuccess(null);
      setErrors({});
      setFormData(getInitialCompanyData(companyInfo));
    }
  };

  const validateForm = () => {
    const parsed = editCompanySchema.safeParse({
      name: formData.name.trim(),
      email: formData.email.trim(),
      tg_bot_token: formData.tg_bot_token.trim(),
      tg_chat_id: formData.tg_chat_id.trim(),
    });

    if (parsed.success) {
      setErrors({});
      return true;
    }

    const nextErrors: FormErrors = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof CompanyFormData;
      nextErrors[field] = issue.message;
    }
    setErrors(nextErrors);
    return false;
  };

  const handleEditCompany = async () => {
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        editCompanyAsync({
          id: formData.id,
          company: {
            name: formData.name.trim(),
            email: formData.email.trim(),
            tg_bot_token: formData.tg_bot_token.trim(),
            tg_chat_id: Number(formData.tg_chat_id.trim()),
          },
        }),
      ).unwrap();

      setSubmitSuccess("Company updated successfully.");
      setOpen(false);
    } catch (error) {
      setSubmitError(
        typeof error === "string" ? error : "An unexpected error occurred",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleDialogOpenChange}>
      <Dialog.Trigger>
        <Button type="button" variant="ghost" size="1">
          <Pencil size={16} />
        </Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="500px">
        <Dialog.Title>Edit Company</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Update company information
        </Dialog.Description>

        <Flex direction="column" gap="3">
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Company Name
            </Text>
            <TextField.Root
              value={formData.name}
              onChange={(event) => handleChange("name", event.target.value)}
              placeholder="Enter company name"
            />
            {errors.name && (
              <Text as="p" size="1" color="red">
                {errors.name}
              </Text>
            )}
          </label>

          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Company Email
            </Text>
            <TextField.Root
              value={formData.email}
              onChange={(event) => handleChange("email", event.target.value)}
              placeholder="Enter company email"
            />
            {errors.email && (
              <Text as="p" size="1" color="red">
                {errors.email}
              </Text>
            )}
          </label>

          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Telegram Bot Token
            </Text>
            <TextField.Root
              value={formData.tg_bot_token}
              onChange={(event) =>
                handleChange("tg_bot_token", event.target.value)
              }
              placeholder="Enter telegram bot token"
            />
            {errors.tg_bot_token && (
              <Text as="p" size="1" color="red">
                {errors.tg_bot_token}
              </Text>
            )}
          </label>

          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Telegram Chat ID
            </Text>
            <TextField.Root
              value={formData.tg_chat_id}
              onChange={(event) =>
                handleChange("tg_chat_id", event.target.value)
              }
              placeholder="Enter telegram chat ID"
            />
            {errors.tg_chat_id && (
              <Text as="p" size="1" color="red">
                {errors.tg_chat_id}
              </Text>
            )}
          </label>

          {submitError && <CustomAlert message={submitError} variant="error" />}
          {submitSuccess && (
            <CustomAlert message={submitSuccess} variant="success" />
          )}
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
          <Button onClick={handleEditCompany} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default DialogForCompanyEdit;
