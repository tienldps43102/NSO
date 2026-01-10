import React from "react";
import { AdminLayout } from "./components";
import "../../styles/_variables.scss"
import "../../styles/_keyframe-animations.scss"
export default function AdminLayoutPage({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
