"use client";

import React, { useEffect, useState } from "react";
import { Button, Dialog, Flex, Text, TextField } from "@radix-ui/themes";
import { useDispatch } from "react-redux";
import { addUserAsync } from "@/state/API/ApiSlice";
import type { AppDispatch } from "@/state/store";

import { createUserSchema } from "@/lib/validationSchema";
import CustomAlert from "@/components/alert";

import { Eye, EyeClosed } from "lucide-react";

type UserFormData = {
  name: string;
  email: string;
  password: string;
  position: string;
  companyId: string;
};

type FormErrors = Partial<Record<keyof UserFormData, string>>;

const DialogForUser = () => {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    position: "",
    companyId: "",
  });
  const dispatch = useDispatch<AppDispatch>();

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
      setSubmitError(null);
      setSubmitSuccess(null);
      setShowPassword(false);
    }
  };

  const validateForm = () => {
    const parsed = createUserSchema.safeParse({
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

  const handleAddUser = async () => {
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        addUserAsync({
          name: userData.name.trim(),
          email: userData.email.trim(),
          password: userData.password,
          companyId: userData.companyId.trim(),
          position: userData.position.trim(),
        }),
      ).unwrap();

      setSubmitSuccess("User added successfully.");
      setUserData({
        name: "",
        email: "",
        password: "",
        position: "",
        companyId: "",
      });
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
      <Dialog.Trigger>
        <Button>Add User</Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Add User</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Add new User
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
              value={userData.position}
              onChange={(event) => handleChange("position", event.target.value)}
              placeholder="Enter user position"
            />
          </label>

          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Company ID
            </Text>
            <TextField.Root
              value={userData.companyId}
              onChange={(event) =>
                handleChange("companyId", event.target.value)
              }
              placeholder="Enter user company ID"
            />
            {errors.companyId && (
              <Text as="p" size="1" color="red">
                {errors.companyId}
              </Text>
            )}
          </label>

          {submitError && <CustomAlert message={submitError} variant="error" />}
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
          <Button onClick={handleAddUser} disabled={isSubmitting}>
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

export default DialogForUser;
