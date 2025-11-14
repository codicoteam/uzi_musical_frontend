import React, { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import userService from "../services/createaccount_service";

export default function CreateAccountScreen() {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "fan",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [] as string[],
  });

  const availableRoles = ["fan", "artist"];
  const navigate = useNavigate();

  // HANDLE INPUT CHANGE ---------------------------------------------------
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

  // PASSWORD STRENGTH CHECK ------------------------------------------------
  const checkPasswordStrength = (password: string) => {
    const feedback: string[] = [];
    let score = 0;

    // Length
    if (password.length >= 8) score++;
    else feedback.push("At least 8 characters");

    // Lowercase
    if (/[a-z]/.test(password)) score++;
    else feedback.push("One lowercase letter");

    // Uppercase
    if (/[A-Z]/.test(password)) score++;
    else feedback.push("One uppercase letter");

    // Digit
    if (/\d/.test(password)) score++;
    else feedback.push("One number");

    // Special char
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++;
    else feedback.push("One special character");

    // Score max is now 5
    setPasswordStrength({ score, feedback });
  };

  // Color for strength bar -------------------------------------------------
  const getPasswordStrengthColor = () => {
    const s = passwordStrength.score;
    if (s === 0) return "bg-gray-200";
    if (s <= 2) return "bg-red-500";
    if (s === 3) return "bg-yellow-500";
    if (s === 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    const s = passwordStrength.score;
    if (s === 0) return "Enter a password";
    if (s <= 2) return "Weak";
    if (s === 3) return "Fair";
    if (s === 4) return "Good";
    return "Strong";
  };

  // VISIBILITY TOGGLE -----------------------------------------------------
  const togglePasswordVisibility = () =>
    setShowPassword((prev) => !prev);

  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword((prev) => !prev);

  // FORM VALIDATION -------------------------------------------------------
  const validateForm = () => {
    const { userName, email, password, confirmPassword, role } =
      formData;

    if (!userName || !email || !password || !confirmPassword || !role) {
      setError("Please fill in all fields");
      return false;
    }

    // Email regex
    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|org|edu|gov|io|co|us|uk|in|ca|de|fr|jp|au|nz|br|mx|es|it|ch|nl|se|no|dk|fi|pt|pl|tr|ru|cn|sg|za|ae)$/i;

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    // Fake email domains
    const fakeEmailDomains = [
      "example.com",
      "test.com",
      "fake.com",
      "temp.com",
      "mailinator.com",
      "guerrillamail.com",
      "10minutemail.com",
      "throwaway.com",
      "yopmail.com",
      "trashmail.com",
    ];

    const emailDomain = email.split("@")[1]?.toLowerCase() || "";
    if (fakeEmailDomains.includes(emailDomain)) {
      setError("Please use a real email address from a legitimate provider");
      return false;
    }

    // Password detailed checks (same as strength)
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter");
      return false;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter");
      return false;
    }

    if (!/\d/.test(password)) {
      setError("Password must contain at least one number");
      return false;
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      setError("Password must contain at least one special character");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (passwordStrength.score < 3) {
      setError("Please choose a stronger password");
      return false;
    }

    return true;
  };

  // SUBMIT HANDLER --------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      const { confirmPassword, ...submitData } = formData;

      const response = await userService.register(submitData);
      console.log("Registration successful:", response);

      setFormData({
        userName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: availableRoles[0] || "",
      });

      setPasswordStrength({ score: 0, feedback: [] });
      setIsLoading(false);

      // SWEETALERT OTP PROMPT
      const { value: code } = await Swal.fire({
        title: "Verify Your Email",
        html: `
          <p class="mb-3 text-gray-700">A verification code has been sent to your email: <b>${submitData.email}</b></p>
          <input type="text" id="otp" class="swal2-input" placeholder="Enter your OTP code" />
        `,
        confirmButtonText: "Verify",
        confirmButtonColor: "#dc2626",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        preConfirm: () => {
          const otp = (document.getElementById("otp") as HTMLInputElement)
            ?.value;
          if (!otp) {
            Swal.showValidationMessage("Please enter the verification code");
          }
          return otp;
        },
      });

      if (code) {
        try {
          const verifyResponse = await userService.verifyEmail(
            submitData.email,
            code
          );
          console.log("Email verification successful:", verifyResponse);

          await Swal.fire({
            title: "Email Verified!",
            text: "Your email has been successfully verified.",
            icon: "success",
            confirmButtonColor: "#dc2626",
          });

          navigate("/home");
        } catch (verifyError: any) {
          console.error("Email verification failed:", verifyError);

          await Swal.fire({
            title: "Verification Failed",
            text:
              verifyError.response?.data?.message ||
              "Invalid or expired verification code. Please try again.",
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

  // RENDER ---------------------------------------------------------------
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

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Username *
              </label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                className="w-full px-5 py-4 text-lg border-2 border-red-300 rounded-lg focus:outline-none focus:border-red-500 bg-gray-50"
                placeholder="Choose a username"
                disabled={isLoading}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-5 py-4 text-lg border-2 border-red-300 rounded-lg focus:outline-none focus:border-red-500 bg-gray-50"
                placeholder="Enter your email address"
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-base font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-5 py-4 text-lg border-2 border-red-300 rounded-lg focus:outline-none focus:border-red-500 bg-gray-50 pr-12"
                  placeholder="Create a strong password"
                  disabled={isLoading}
                />

                {/* Password Visibility Toggle */}
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              {/* Password Strength Bar */}
              {formData.password && (
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      Password Strength: {getPasswordStrengthText()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {passwordStrength.score}/5
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{
                        width: `${(passwordStrength.score / 5) * 100}%`,
                      }}
                    ></div>
                  </div>

                  {passwordStrength.feedback.length > 0 && (
                    <ul className="text-xs text-gray-600 mt-3 space-y-1 list-disc list-inside">
                      {passwordStrength.feedback.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label className="block text-base font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-5 py-4 text-lg border-2 border-red-300 rounded-lg bg-gray-50 pr-12 focus:outline-none focus:border-red-500"
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />

                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>

              {formData.confirmPassword &&
                formData.password !== formData.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">
                    Passwords do not match
                  </p>
                )}

              {formData.confirmPassword &&
                formData.password === formData.confirmPassword && (
                  <p className="text-green-600 text-sm mt-1">
                    Passwords match!
                  </p>
                )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-5 py-4 text-lg border-2 border-red-300 rounded-lg bg-gray-50 focus:outline-none focus:border-red-500"
              >
                {availableRoles.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 text-lg font-semibold text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50"
              style={{
                background:
                  "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
              }}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
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
