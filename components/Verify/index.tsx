// File: /components/Verify/index.tsx
"use client";
import {
  MiniKit,
  VerificationLevel,
  ISuccessResult,
  MiniAppVerifyActionErrorPayload,
  IVerifyResponse,
} from "@worldcoin/minikit-js";
import { useCallback, useState } from "react";

export function VerifyBlock({
  onVerifySuccess,
}: {
  onVerifySuccess?: () => void;
}) {
  const [handleVerifyResponse, setHandleVerifyResponse] = useState<
    MiniAppVerifyActionErrorPayload | IVerifyResponse | null
  >(null);

  const handleVerify = useCallback(async () => {
    if (!MiniKit.isInstalled()) {
      console.warn("MiniKit not installed!");
      return null;
    }

    const verifyPayload = {
      action: "verify",
      signal: "verify",
      verification_level: VerificationLevel.Device,
    };

    const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);

    if (finalPayload.status === "error") {
      setHandleVerifyResponse(finalPayload);
      return finalPayload;
    }

    // Next: call your /api/verify
    const verifyResponse = await fetch(`/api/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payload: finalPayload as ISuccessResult,
        action: verifyPayload.action,
        signal: verifyPayload.signal,
      }),
    });

    const verifyResponseJson = await verifyResponse.json();
    setHandleVerifyResponse(verifyResponseJson);

    if (verifyResponseJson.status === 200 && onVerifySuccess) {
      onVerifySuccess();
    }
    return verifyResponseJson;
  }, [onVerifySuccess]);

  return (
    <div className="flex flex-col items-center text-center gap-2">
      <button
        className="bg-green-600 text-white font-semibold py-2 px-6 rounded shadow hover:bg-green-700 transition-colors"
        onClick={handleVerify}
      >
        Verify
      </button>
      {/* If you do want to see debug info, keep it. Otherwise, remove or hide behind a toggle */}
      {handleVerifyResponse && (
        <pre className="text-xs bg-gray-50 border rounded p-2 mt-3 w-full max-w-xs">
          {JSON.stringify(handleVerifyResponse, null, 2)}
        </pre>
      )}
    </div>
  );
}
