import { useState } from "react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  albumName: string;
  albumArtist: string;
  albumImage: string;
  supportAmount: number;
  isDarkMode?: boolean;
}

const PaymentModal = ({
  isOpen,
  onClose,
  albumName,
  albumArtist,
  albumImage,
  supportAmount,
  isDarkMode = false,
}: PaymentModalProps) => {
  const [includeShipping, setIncludeShipping] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [callingNumber, setCallingNumber] = useState("");

  if (!isOpen) return null;

  const shippingCost = 10.0;
  const totalAmount = includeShipping ? supportAmount + shippingCost : supportAmount;
  const invoiceNumber = "INV-0XG26UIB0";

const themeClasses = {
    bg: isDarkMode ? "bg-gray-900" : "bg-white",
    text: isDarkMode ? "text-white" : "text-gray-900",
    textSecondary: isDarkMode ? "text-gray-400" : "text-gray-600",
    border: isDarkMode ? "border-gray-700" : "border-gray-200",
    input: isDarkMode ? "bg-gray-800 text-white" : "bg-gray-50 text-gray-900",
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl ${themeClasses.bg} shadow-2xl animate-slideUp`}
      >
        <div className="overflow-y-auto max-h-[90vh] p-8">
          {/* Header */}
          <h2 className={`text-3xl font-bold ${themeClasses.text} text-center mb-6`}>
            Payment Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Album Image and Shipping */}
            <div className="space-y-6">
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <img
                  src={albumImage}
                  alt={albumName}
                  className="w-full aspect-square rounded-lg shadow-lg"
                />
              </div>

              <div>
                <h3 className={`text-xl font-bold ${themeClasses.text} mb-4`}>
                  Shipping Details
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Shipping address *"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg ${themeClasses.input} placeholder-gray-400 border border-gray-600 focus:outline-none focus:border-cyan-400`}
                  />
                  <input
                    type="text"
                    placeholder="Delivery Instructions *"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg ${themeClasses.input} placeholder-gray-400 border border-gray-600 focus:outline-none focus:border-cyan-400`}
                  />
                  <input
                    type="text"
                    placeholder="Calling Number *"
                    value={callingNumber}
                    onChange={(e) => setCallingNumber(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg ${themeClasses.input} placeholder-gray-400 border border-gray-600 focus:outline-none focus:border-cyan-400`}
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Payment Details */}
            <div className="space-y-6">
              <div className="space-y-3">
                <p className={`text-sm ${themeClasses.textSecondary}`}>
                  Invoice: <span className="text-cyan-400">{invoiceNumber}</span>
                </p>
                <p className={`text-lg font-bold ${themeClasses.text}`}>
                  {albumName} <span className="font-normal">by</span> {albumArtist}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={themeClasses.textSecondary}>Support Amount:</span>
                    <span className={themeClasses.text}>${supportAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="shipping"
                        checked={includeShipping}
                        onChange={(e) => setIncludeShipping(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-700"
                      />
                      <label htmlFor="shipping" className={themeClasses.textSecondary}>
                        Include Shipping:
                      </label>
                    </div>
                    <span className={themeClasses.text}>${shippingCost.toFixed(2)}</span>
                  </div>
                </div>

                <div className={`border-t ${themeClasses.border} pt-3 mt-3`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-lg font-bold ${themeClasses.text}`}>Total Amount:</span>
                    <span className={`text-2xl font-bold ${themeClasses.text}`}>
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <p className={`text-xs ${themeClasses.textSecondary} text-right mt-1`}>
                    (Excludes Transaction Charges)
                  </p>
                </div>
              </div>

              <div>
                <h3 className={`text-lg font-bold ${themeClasses.text} mb-3`}>
                  Choose Payment Method
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="zig"
                      checked={selectedPayment === "zig"}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className={themeClasses.text}>ZiG Local Payment</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="usd-local"
                      checked={selectedPayment === "usd-local"}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className={themeClasses.text}>USD Local Payment</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="usd-intl"
                      checked={selectedPayment === "usd-intl"}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className={themeClasses.text}>USD International</span>
                  </label>
                </div>
              </div>

              <button className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-all duration-300 shadow-lg transform hover:scale-105">
                PROCEED
              </button>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={onClose}
              className="px-8 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all duration-300"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;