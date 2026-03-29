"use client";

import React, { useEffect, useState } from "react";
import { Button, Dialog, Flex, Text, TextField } from "@radix-ui/themes";
import { useDispatch } from "react-redux";
import { editUserAsync } from "@/state/API/ApiSlice";
import type { AppDispatch } from "@/state/store";

import { createUserSchema, updateUserSchema } from "@/lib/validationSchema";
import CustomAlert from "@/components/alert";
import { z } from "zod";

import { Eye, EyeClosed, Pencil } from "lucide-react";
import type { User } from "@/state/API/ApiSlice";

type UserFormData = {
  name: string;
  email: string;
  password: string;
  Position: string;
  companyId: string;
};

type EditUserFormData = UserFormData & {
  id: string;
};

type FormErrors = Partial<Record<keyof UserFormData, string>>;

const editUserSchema = z.object({
  name: updateUserSchema.shape.name.unwrap(),
  email: updateUserSchema.shape.email.unwrap(),
  password: createUserSchema.shape.password.or(z.literal("")),
  companyId: createUserSchema.shape.companyId,
});

const getInitialUserData = (userInfo: User): EditUserFormData => ({
  id: userInfo.id ?? "",
  name: userInfo.name,
  email: userInfo.email,
  password: "",
  Position: userInfo.Position ?? "",
  companyId: userInfo.companyId ?? "",
});

const DialogForUserEdit = ({ userInfo }: { userInfo: User }) => {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const [userData, setUserData] = useState<EditUserFormData>(
    getInitialUserData(userInfo),
  );
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    setUserData(getInitialUserData(userInfo));
  }, [userInfo]);

  useEffect(() => {
    if (!submitSuccess) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setSubmitSuccess(null);
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [submitSuccess]);

  const handleChange = (field: keyof UserFormData, value: string) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setUserData(getInitialUserData(userInfo));
      setSubmitError(null);
      setSubmitSuccess(null);
      setShowPassword(false);
    }
  };

  const validateForm = () => {
    const parsed = editUserSchema.safeParse({
      name: userData.name.trim(),
      email: userData.email.trim(),
      password: userData.password,
      companyId: userData.companyId.trim(),
    });

    if (parsed.success) {
      setErrors({});
      return true;
    }

    const nextErrors: FormErrors = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof UserFormData;
      nextErrors[field] = issue.message;
    }
    setErrors(nextErrors);
    return false;
  };

  const handleEditUser = async () => {
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!validateForm()) {
      return;
    }

    if (!userData.id) {
      setSubmitError("User ID is missing.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        editUserAsync({
          user: {
            id: userData.id,
            name: userData.name.trim(),
            email: userData.email.trim(),
            password: userData.password.trim() || undefined,
            companyId: userData.companyId.trim(),
            Position: userData.Position.trim(),
          },
          id: userData.id,
        }),
      ).unwrap();

      setSubmitSuccess("User edited successfully.");
      setUserData(getInitialUserData(userInfo));
      setShowPassword(false);
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
      <Dialog.Trigger className="inline-flex h-6 w-6 items-center justify-center rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 pt-1">
        <Button type="button" variant="ghost" size="1">
          <Pencil size={16} />
        </Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Edit User Info</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Edit Existing User
        </Dialog.Description>

        <Flex direction="column" gap="3">
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Full Name
            </Text>

            <TextField.Root
              value={userData.name}
              onChange={(event) => handleChange("name", event.target.value)}
              placeholder="Enter user full name"
            />
            {errors.name && (
              <Text as="p" size="1" color="red">
                {errors.name}
              </Text>
            )}
          </label>

          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Email
            </Text>
            <TextField.Root
              value={userData.email}
              onChange={(event) => handleChange("email", event.target.value)}
              placeholder="Enter user email"
            />
            {errors.email && (
              <Text as="p" size="1" color="red">
                {errors.email}
              </Text>
            )}
          </label>

          <div>
            <Text as="div" size="2" mb="1" weight="bold">
              Password
            </Text>
            <div className="flex w-full items-center gap-2">
              <TextField.Root
                type={showPassword ? "text" : "password"}
                value={userData.password}
                onChange={(event) =>
                  handleChange("password", event.target.value)
                }
                placeholder="Enter user password"
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="1"
                mt="1"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <Eye /> : <EyeClosed />}
              </Button>
            </div>
            {errors.password && (
              <Text as="p" size="1" color="red">
                {errors.password}
              </Text>
            )}
          </div>

          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Position
            </Text>
            <TextField.Root
              value={userData.Position}
              onChange={(event) => handleChange("Position", event.target.value)}
              placeholder="Enter user position"
            />
          </label>

          {submitError && <CustomAlert message={submitError} variant="error" />}
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
          <Button onClick={handleEditUser} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </Flex>
      </Dialog.Content>

      {submitSuccess && (
        <CustomAlert message={submitSuccess} variant="success" />
      )}
    </Dialog.Root>
  );
};

export default DialogForUserEdit;
