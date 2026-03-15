import { BackBtn } from "./back-btn";
import { ProgressDots } from "./progress-dots";
import { Screen } from "./screen";
import { MindMateColors as C } from "@/constants/theme";
import { ReactNode } from "react";

interface OBWrapProps {
  step: number;
  total: number;
  onBack: () => void;
  aurora: string[];
  children: ReactNode;
}

export const OBWrap = ({
  step,
  total,
  onBack,
  aurora,
  children,
}: OBWrapProps) => (
  <Screen aurora={aurora} stars={11} scroll={false}>
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "13px 21px 24px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 13,
        }}
      >
        <BackBtn onClick={onBack} />
        <ProgressDots step={step} total={total} />
        <span
          style={{
            fontSize: 11,
            color: C.muted,
            fontFamily: "'Nunito',sans-serif",
            fontWeight: 700,
          }}
        >
          {step}/{total}
        </span>
      </div>
      {children}
    </div>
  </Screen>
);
