"use client";
import { useState } from "react";
import { VerifyBlock } from "@/components/Verify";
import FlightTracker from "@/components/FlightTracker";

export default function Home() {
  const [isVerified, setIsVerified] = useState(false);

  return (
    <main className="min-h-screen w-full">
      {!isVerified && (
        <section className="relative flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-b from-blue-50 to-white p-4">
          {/* Plane image */}
          <img
            src="/beautiful_plane.png"
            alt="Beautiful Plane"
            className="w-80 md:w-[28rem] h-auto mb-6 drop-shadow-xl"
          />

          {/* App Title */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2">
            Welcome to Fli
          </h1>
          <p className="text-md md:text-lg text-gray-600 mb-8">
            Your one-stop flight status and identity verification portal.
          </p>

          {/* Verification block */}
          <VerifyBlock
            onVerifySuccess={() => {
              setIsVerified(true);
            }}
          />
        </section>
      )}

      {/* Once verified, show the flight tracking UI */}
      {isVerified && <FlightTracker />}
    </main>
  );
}
