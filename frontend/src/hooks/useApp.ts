import { useContext } from "react";
import { CartContext, DataContext, SessionContext, UIContext } from "@/context/contexts";

function required<T>(value: T | null, name: string): T {
  if (!value) throw new Error(`${name} must be used inside its provider`);
  return value;
}

export const useSession = () => required(useContext(SessionContext), "useSession");
export const useData = () => required(useContext(DataContext), "useData");
export const useCart = () => required(useContext(CartContext), "useCart");
export const useUI = () => required(useContext(UIContext), "useUI");
