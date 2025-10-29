import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  albumName: string;
  albumArtist: string;
  albumImage: string;
  supportAmount: number;
  isDarkMode?: boolean;
}

interface PaymentOption {
  value: string;
  label: string;
  options: string[];
}

const PaymentModal = ({
  isOpen,
  onClose,
  albumName,
  albumArtist,
  albumImage,
  supportAmount,
}: PaymentModalProps) => {
  const [includeShipping, setIncludeShipping] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [selectedPaymentOption, setSelectedPaymentOption] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [callingNumber, setCallingNumber] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  if (!isOpen) return null;

  const paymentMethods: PaymentOption[] = [
    {
      value: "zig",
      label: "ZiG Local Payment",
      options: ["Ecocash", "OneMoney", "Innbucks", "Telecash"],
    },
    {
      value: "usd-local",
      label: "USD Local Payment",
      options: ["Ecocash USD", "OneMoney USD", "Visa/Mastercard"],
    },
    {
      value: "usd-intl",
      label: "USD International",
      options: ["Visa", "Mastercard", "PayPal", "Stripe"],
    },
  ];

  const shippingCost = 10.0;
  const totalAmount = includeShipping
    ? supportAmount + shippingCost
    : supportAmount;
  const invoiceNumber = "INV-0XG26UIB0";

  const selectedMethod = paymentMethods.find(
    (m) => m.value === selectedPayment
  );

  const handleWhatsApp = (message: string) => {
    const phone = "+263784351146";
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[95vh] overflow-hidden rounded-3xl bg-white shadow-2xl animate-slideUp">
        <div className="overflow-y-auto max-h-[95vh]">
          {/* Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 py-4 sm:py-5 z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Complete Payment
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Left Column - Album & Invoice */}
              <div className="space-y-6">
                {/* Album Card */}
                <div className="bg-linear-to-br from-gray-50 to-gray-100 p-4 sm:p-5 rounded-2xl">
                  <div className="flex gap-4">
                    <img
                      src={albumImage}
                      alt={albumName}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg shadow-md object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                        {albumName}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {albumArtist}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Invoice:{" "}
                        <span className="text-green-600 font-medium">
                          {invoiceNumber}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl space-y-3">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                    Order Summary
                  </h3>

                  <div className="space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Support Amount</span>
                      <span className="font-semibold text-gray-900">
                        ${supportAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="shipping"
                          checked={includeShipping}
                          onChange={(e) => setIncludeShipping(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <label
                          htmlFor="shipping"
                          className="text-gray-600 cursor-pointer"
                        >
                          Include Shipping
                        </label>
                      </div>
                      <span className="font-semibold text-gray-900">
                        ${shippingCost.toFixed(2)}
                      </span>
                    </div>

                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-bold text-gray-900">
                          Total
                        </span>
                        <span className="text-2xl font-bold text-green-600">
                          ${totalAmount.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 text-right mt-1">
                        Excludes transaction fees
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shipping Details - Only show when shipping is included */}
                {includeShipping && (
                  <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                      Shipping Information
                    </h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Delivery address"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Delivery instructions (optional)"
                        value={deliveryInstructions}
                        onChange={(e) =>
                          setDeliveryInstructions(e.target.value)
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                      <input
                        type="tel"
                        placeholder="Contact number"
                        value={callingNumber}
                        onChange={(e) => setCallingNumber(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Payment Methods */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                    Payment Method
                  </h3>

                  {/* Payment Method Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-left flex items-center justify-between hover:border-green-500 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    >
                      <span
                        className={
                          selectedPayment
                            ? "text-gray-900 font-medium"
                            : "text-gray-400"
                        }
                      >
                        {selectedMethod
                          ? selectedMethod.label
                          : "Select payment method"}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          showDropdown ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {showDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                        {paymentMethods.map((method) => (
                          <button
                            key={method.value}
                            onClick={() => {
                              setSelectedPayment(method.value);
                              setSelectedPaymentOption("");
                              setShowDropdown(false);
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm ${
                              selectedPayment === method.value
                                ? "bg-green-50 text-green-700 font-medium"
                                : "text-gray-900"
                            }`}
                          >
                            {method.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Payment Options */}
                  {selectedMethod && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-600 mb-3 font-medium">
                        Select payment option:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedMethod.options.map((option) => (
                          <button
                            key={option}
                            onClick={() => setSelectedPaymentOption(option)}
                            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                              selectedPaymentOption === option
                                ? "bg-green-600 text-white shadow-md"
                                : "bg-white text-gray-700 border border-gray-200 hover:border-green-500"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    disabled={!selectedPayment || !selectedPaymentOption}
                    className="w-full py-3.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
                  >
                    Proceed to Payment
                  </button>

                  <button
                    onClick={() =>
                      handleWhatsApp(
                        "Hi, I'd like to arrange cash pickup for my order."
                      )
                    }
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl transition-all duration-200 text-sm"
                  >
                    Cash Pickup
                  </button>

                  <button
                    onClick={() =>
                      handleWhatsApp(
                        "Hi, I don't see my preferred payment method. Can you help?"
                      )
                    }
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl transition-all duration-200 text-sm"
                  >
                    I Don't See My Payment Method
                  </button>
                </div>

                {/* PesePay Badge */}
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
                  </svg>
                  <span>Secured by PesePay</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
