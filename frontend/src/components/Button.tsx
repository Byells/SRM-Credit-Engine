import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

function Button({ variant = "primary", className, ...props }: ButtonProps) {
  const variantClass =
    variant === "secondary" ? "button-secondary" : "button-primary";
  const classes = [variantClass, className].filter(Boolean).join(" ");
  return <button className={classes} {...props} />;
}

export default Button;
