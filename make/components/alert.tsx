import React from "react";
import { Callout, Text } from "@radix-ui/themes";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

type AlertVariant = "success" | "error";

type AlertProps = {
  message: string;
  variant: AlertVariant;
};

const variantConfig: Record<
  AlertVariant,
  { color: "green" | "red"; Icon: React.ComponentType<{ size?: number }> }
> = {
  success: {
    color: "green",
    Icon: CheckCircle2,
  },
  error: {
    color: "red",
    Icon: AlertTriangle,
  },
};

const CustomAlert = ({ message, variant }: AlertProps) => {
  const { color, Icon } = variantConfig[variant];

  return (
    <Callout.Root color={color} role="status" size="1">
      <Callout.Icon>
        <Icon size={16} />
      </Callout.Icon>
      <Callout.Text>
        <Text>{message}</Text>
      </Callout.Text>
    </Callout.Root>
  );
};

export default CustomAlert;
