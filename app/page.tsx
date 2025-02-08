// File: /app/page.tsx
"use client";
import { useState } from "react";
import { VerifyBlock } from "@/components/Verify";
import FlightTracker from "@/components/FlightTracker";

export default function Home() {
  const [isVerified, setIsVerified] = useState(false);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      {/** If not verified, show the VerifyBlock */}
      {!isVerified && (
        <VerifyBlock
          onVerifySuccess={() => {
            setIsVerified(true);
          }}
        />
      )}

      {/** Once user is verified, show the flight tracker map+search UI */}
      {isVerified && <FlightTracker />}
    </main>
  );
}
