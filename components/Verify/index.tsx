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

    // your existing verify payload
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payload: finalPayload as ISuccessResult,
        action: verifyPayload.action,
        signal: verifyPayload.signal,
      }),
    });

    const verifyResponseJson = await verifyResponse.json();

    setHandleVerifyResponse(verifyResponseJson);

    if (verifyResponseJson.status === 200) {
      console.log("Verification success!");
      // <-- trigger callback
      if (onVerifySuccess) onVerifySuccess();
    }

    return verifyResponseJson;
  }, [onVerifySuccess]);

  return (
    <div className="flex flex-col items-center border p-4 rounded gap-2">
      <h1 className="font-bold text-lg">Verification</h1>
      <button
        className="bg-green-500 p-2 text-white rounded"
        onClick={handleVerify}
      >
        Verify
      </button>
      <pre className="text-xs mt-2">
        {JSON.stringify(handleVerifyResponse, null, 2)}
      </pre>
    </div>
  );
}
