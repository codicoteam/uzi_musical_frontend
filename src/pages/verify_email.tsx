import React, { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";
import userService from "../services/createaccount_service";

export default function VerifyEmailScreen() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Email from state or storage fallback
  const email =
    location.state?.email ||
    (() => {
      try {
        const stored = localStorage.getItem("userRegister");
        return stored
          ? JSON.parse(stored).user?.email ||
          JSON.parse(stored).email
          : "";
      } catch {
        return "";
      }
    })();

  const inputRefs = useRef([]);

  // Start timer on mount
  useEffect(() => {
    setResendTimer(60);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Handle number input
  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (error) setError("");

    // Auto-focus next
    if (value && index < 5) inputRefs.current[index + 1]?.focus();

    // Auto-verify
    if (index === 5 && value && newOtp.every((d) => d !== "")) {
      setTimeout(() => handleVerify(newOtp.join("")), 100);
    }
  };

  // Backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Pasting OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(pasted)) return;

    const digits = pasted.split("");
    const newOtp = [...otp];

    digits.forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });

    setOtp(newOtp);

    if (digits.length === 6) {
      setTimeout(() => handleVerify(pasted), 100);
    } else {
      inputRefs.current[digits.length]?.focus();
    }
  };

  // Verification handler
  const handleVerify = async (otpCode = null) => {
    const otpString = otpCode || otp.join("");

    if (otpString.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    if (!email) {
      setError("Email not found. Please register again.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await userService.verifyEmail(email, otpString);
      console.log("Verification successful:", response);

      setSuccess(true);

      await Swal.fire({
        title: "Verified!",
        text: "Your email has been successfully verified!",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
        confirmButtonColor: "#dc2626",
      });

      navigate("/home");
    } catch (error) {
      console.error("Verification failed:", error);
      setIsLoading(false);

      let msg = "Verification failed. Please try again.";

      if (error.response?.status === 400) msg = "Invalid OTP code. Please try again.";
      else if (error.response?.status === 401) msg = "OTP expired. Please request a new code.";
      else if (error.response?.data?.message) msg = error.response.data.message;
      else if (error.message) msg = error.message;

      setError(msg);

      // Shake animation
      inputRefs.current.forEach((ref) => {
        if (ref) {
          ref.classList.add("shake");
          setTimeout(() => ref.classList.remove("shake"), 500);
        }
      });

      await Swal.fire({
        title: "Verification Failed",
        text: msg,
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setIsResending(true);
    setError("");

    try {
      console.log("Resending OTP to:", email);

      await new Promise((resolve) => setTimeout(resolve, 1000)); // simulate API call

      await Swal.fire({
        title: "Code Sent!",
        text: "A new verification code has been sent to your email.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        confirmButtonColor: "#dc2626",
      });

      setResendTimer(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "Failed to resend OTP. Please try again.";
      setError(msg);

      await Swal.fire({
        title: "Resend Failed",
        text: msg,
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <style>{`
        @keyframes shake { 0%,100%{translate:0} 25%{translate:-10px} 75%{translate:10px}}
        .shake { animation: shake .3s ease-in-out }
      `}</style>

      <div className="w-full max-w-2xl slide-in">
        {/* Header */}
        <div
          className="rounded-t-3xl p-12 text-center"
          style={{
            background: "linear-gradient(135deg,#dc2626 0%,#b91c1c 100%)",
          }}
        >
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
              {success ? (
                <svg
                  className="w-12 h-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-12 h-12 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              )}
            </div>
          </div>

          <h1 className="text-5xl font-bold text-white mb-2">
            {success ? "Verified!" : "Verify Email"}
          </h1>

          {!success && (
            <>
              <p className="text-red-100 text-lg">We've sent a 6-digit code to</p>
              <p className="text-white font-semibold text-lg mt-2 break-all">
                {email}
              </p>
            </>
          )}
        </div>

        {/* Body */}
        <div className="bg-white shadow-2xl rounded-b-3xl p-12 border-x border-b border-red-200">
          {/* Error box */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-center">{error}</p>
            </div>
          )}

          {/* Success Display */}
          {success ? (
            <div className="text-center py-8">
              <svg
                className="w-20 h-20 text-green-500 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-2xl font-bold mt-3">Email Verified!</h2>
              <p className="text-gray-600">Redirecting…</p>
            </div>
          ) : (
            <>
              {/* OTP inputs */}
              <label className="block text-center text-lg font-medium mb-4">
                Enter Verification Code
              </label>

              <div className="flex justify-center gap-3 mb-6">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    disabled={isLoading}
                    className="w-14 h-16 text-center text-2xl font-bold border-2 border-red-300 rounded-lg bg-gray-50 focus:border-red-500"
                  />
                ))}
              </div>

              {/* Verify button */}
              <button
                onClick={() => handleVerify()}
                disabled={isLoading || otp.some((d) => !d)}
                className="w-full bg-red-600 text-white font-semibold py-4 rounded-lg shadow-lg disabled:opacity-50"
              >
                {isLoading ? "Verifying..." : "Verify Email"}
              </button>

              {/* Resend */}
              <div className="text-center mt-6">
                <p className="text-gray-600 mb-2">Didn't receive the code?</p>

                <button
                  type="button"
                  disabled={resendTimer > 0 || isResending}
                  onClick={handleResendOTP}
                  className="text-red-600 font-semibold disabled:opacity-50"
                >
                  {isResending
                    ? "Sending..."
                    : resendTimer > 0
                      ? `Resend Code (${resendTimer}s)`
                      : "Resend Code"}
                </button>
              </div>

              <div className="text-center mt-6 border-t pt-4">
                <p className="text-gray-600">
                  Wrong email?{" "}
                  <button
                    className="text-red-600 font-semibold"
                    onClick={() => navigate(-1)}
                  >
                    Go back
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
