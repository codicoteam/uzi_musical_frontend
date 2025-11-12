import React, { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import userService from "../services/createaccount_service";

export default function CreateAccountScreen() {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    role: "fan",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    strength: "",
    score: 0,
    color: "bg-gray-200",
    textColor: "text-gray-500"
  });
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "password") {
      checkPasswordStrength(value);
    }

    if (error) setError("");
  };

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    
    // Length check
    if (password.length >= 5) score += 1;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    let strength = "";
    let color = "bg-gray-200";
    let textColor = "text-gray-500";

    if (password.length === 0) {
      strength = "";
      color = "bg-gray-200";
      textColor = "text-gray-500";
    } else if (password.length < 5) {
      strength = "Too short";
      color = "bg-red-500";
      textColor = "text-red-600";
    } else if (score <= 2) {
      strength = "Weak";
      color = "bg-red-500";
      textColor = "text-red-600";
    } else if (score <= 4) {
      strength = "Medium";
      color = "bg-yellow-500";
      textColor = "text-yellow-600";
    } else {
      strength = "Strong";
      color = "bg-green-500";
      textColor = "text-green-600";
    }

    // Calculate width percentage for progress bar
    const widthPercentage = password.length === 0 ? 0 : 
                           password.length < 5 ? (password.length / 5) * 25 :
                           score <= 2 ? 33 :
                           score <= 4 ? 66 : 100;

    setPasswordStrength({
      strength,
      score: widthPercentage,
      color,
      textColor
    });
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // ✅ Updated password validation (5+ characters)
  const validateForm = () => {
    const { userName, email, password, role } = formData;

    if (!userName || !email || !password || !role) {
      setError("Please fill in all fields");
      return false;
    }

    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|org|edu|gov|io|co|us|uk|in|ca|de|fr|jp|au|nz|br|mx|es|it|ch|nl|se|no|dk|fi|pt|pl|tr|ru|cn|sg|za|ae)$/i;

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    // ✅ Updated password validation (5+ characters with letters and numbers)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{5,}$/;

    if (!passwordRegex.test(password)) {
      setError(
        "Password must be at least 5 characters long and include both letters and numbers."
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await userService.register(formData);
      console.log("Registration successful:", response);
      setIsLoading(false);

      // ✅ Ask user to verify email with OTP
      const { value: code } = await Swal.fire({
        title: "Verify Your Email",
        html: `
          <p class="mb-3 text-gray-700">A verification code has been sent to your email: <b>${formData.email}</b></p>
          <input type="text" id="otp" class="swal2-input" placeholder="Enter your OTP code" />
        `,
        confirmButtonText: "Verify",
        confirmButtonColor: "#dc2626",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        preConfirm: () => {
          const otp = (document.getElementById("otp") as HTMLInputElement)?.value;
          if (!otp) {
            Swal.showValidationMessage("Please enter the verification code");
          }
          return otp;
        },
      });

      if (code) {
        try {
          const verifyResponse = await userService.verifyEmail({
            email: formData.email,
            code,
          });
          console.log("Email verified:", verifyResponse);

          await Swal.fire({
            title: "Success!",
            text: "Your email has been verified successfully.",
            icon: "success",
            confirmButtonColor: "#dc2626",
            timer: 2000,
            showConfirmButton: false,
          });

          navigate("/home");
        } catch (verifyError: any) {
          console.error("Email verification failed:", verifyError);
          await Swal.fire({
            title: "Verification Failed",
            text:
              verifyError.response?.data?.message ||
              "Invalid verification code. Please try again.",
            icon: "error",
            confirmButtonColor: "#dc2626",
          });
        }
      }
    } catch (error: any) {
      console.error("Registration failed:", error);
      setIsLoading(false);

      let errorMessage = "Registration failed. Please try again.";
      if (error.response?.status === 500) {
        errorMessage =
          "Server error. Please try again later or contact support.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);

      await Swal.fire({
        title: "Registration Failed",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div
          className="rounded-t-3xl p-12 text-center"
          style={{
            background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
          }}
        >
          <h1 className="text-5xl font-bold text-white mb-3">Create Account</h1>
          <p className="text-red-100 text-lg">Join us today and get started</p>
        </div>

        <div className="bg-white shadow-2xl rounded-b-3xl p-12 border-x border-b border-red-200">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="userName"
                className="block text-base font-medium text-gray-700 mb-2"
              >
                Username *
              </label>
              <input
                type="text"
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                className="w-full px-5 py-4 text-lg border-2 border-red-300 rounded-lg focus:outline-none focus:border-red-500 bg-gray-50"
                placeholder="Choose a username"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-base font-medium text-gray-700 mb-2"
              >
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-5 py-4 text-lg border-2 border-red-300 rounded-lg focus:outline-none focus:border-red-500 bg-gray-50"
                placeholder="Enter your email address"
                disabled={isLoading}
              />
            </div>

            <div className="relative">
              <label
                htmlFor="password"
                className="block text-base font-medium text-gray-700 mb-2"
              >
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-5 py-4 text-lg border-2 border-red-300 rounded-lg focus:outline-none focus:border-red-500 bg-gray-50 pr-12"
                  placeholder="Create a strong password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Password strength:
                    </span>
                    <span className={`text-sm font-semibold ${passwordStrength.textColor}`}>
                      {passwordStrength.strength}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.score}%` }}
                    ></div>
                  </div>
                </div>
              )}

             
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-base font-medium text-gray-700 mb-2"
              >
                Role *
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-5 py-4 text-lg border-2 border-red-300 rounded-lg focus:outline-none focus:border-red-500 bg-gray-50"
                disabled={isLoading}
              >
                <option value="fan">Fan</option>
                <option value="artist">Artist</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white font-semibold py-4 text-lg rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-4 disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
              }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 text-base">
              Already have an account?{" "}
              <a
                href="/"
                className="text-red-600 hover:text-red-700 font-semibold"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}