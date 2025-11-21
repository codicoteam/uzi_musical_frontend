import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import PaymentsService from "../../services/payment_service"; // Adjust the import path as needed

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  albumName: string;
  albumArtist: string;
  albumImage: string;
  supportAmount: number;
  albumId?: string; // Add albumId to props
  plaqueType?: string; // Add plaqueType to props
  isDarkMode?: boolean;
}

interface PaymentOption {
  value: string;
  label: string;
  options: string[];
  methodData?: ApiPaymentMethod;
}

interface ApiPaymentMethod {
  createdBy: string | null;
  lastModifiedBy: string;
  lastModifiedDate: string;
  createdDate: string;
  version: number;
  deleted: boolean;
  id: number;
  name: string;
  description: string;
  code: string;
  reverseProxyName: string | null;
  maximumAmount: number;
  minimumAmount: number;
  redirectRequired: boolean;
  redirectURL: string | null;
  active: boolean;
  requiredFields: Array<{
    fieldType: string;
    name: string;
    displayName: string;
    optional: boolean;
  }>;
  currencies: string[];
  receivingAccountRequiredFields: any[];
  pesepayAccountRequiredFields: any[];
  imageFileName: string;
  processingPaymentMessage: string;
}

interface Currency {
  createdBy: string | null;
  lastModifiedBy: string;
  lastModifiedDate: string;
  createdDate: string;
  version: number;
  deleted: boolean;
  id: number;
  name: string;
  description: string;
  code: string;
  defaultCurrency: boolean;
  rateToDefault: number;
  active: boolean;
}

const PaymentModal = ({
  isOpen,
  onClose,
  albumName,
  albumArtist,
  albumImage,
  supportAmount,
  albumId, // Receive albumId from props
  plaqueType = "Gold", // Default plaque type
}: PaymentModalProps) => {
  const [includeShipping, setIncludeShipping] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [selectedPaymentOption, setSelectedPaymentOption] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [callingNumber, setCallingNumber] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentOption[]>([]);
  const [allPaymentMethods, setAllPaymentMethods] = useState<ApiPaymentMethod[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Calculate total amount
  const shippingCost = 10.0;
  const totalAmount = includeShipping
    ? supportAmount + shippingCost
    : supportAmount;

  // Fetch currencies when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCurrencies();
    }
  }, [isOpen]);
   
  // Fetch payment methods when currency changes
  useEffect(() => {
    if (isOpen && selectedCurrency) {
      fetchPaymentMethodsForCurrency(selectedCurrency);
    }
  }, [selectedCurrency, isOpen]);

  const fetchCurrencies = async () => {
    setIsInitializing(true);
    setError(null);
    
    try {
      console.log("Fetching currencies from PesePay...");
      const currenciesResponse = await fetch("https://api.pesepay.com/api/payments-engine/v1/currencies/active", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      if (!currenciesResponse.ok) {
        throw new Error(`Failed to fetch currencies: ${currenciesResponse.status}`);
      }
      
      const currenciesData = await currenciesResponse.json();
      console.log("Currencies response:", currenciesData);
      setCurrencies(currenciesData);

      // Set default currency
      if (currenciesData && currenciesData.length > 0) {
        const usdCurrency = currenciesData.find((curr: Currency) => curr.code === "USD");
        const defaultCurrency = currenciesData.find((curr: Currency) => curr.defaultCurrency);
        
        if (usdCurrency) {
          setSelectedCurrency("USD");
        } else if (defaultCurrency) {
          setSelectedCurrency(defaultCurrency.code);
        } else {
          setSelectedCurrency(currenciesData[0].code);
        }
      }

    } catch (err: any) {
      console.error("Error fetching currencies:", err);
      setError(err.message || "Failed to load currencies. Please try again.");
    } finally {
      setIsInitializing(false);
    }
  };

  const fetchPaymentMethodsForCurrency = async (currencyCode: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching payment methods for currency: ${currencyCode}...`);
      const paymentMethodsResponse = await fetch(`https://api.pesepay.com/api/payments-engine/v1/payment-methods/for-currency?currencyCode=${currencyCode}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      if (!paymentMethodsResponse.ok) {
        throw new Error(`Failed to fetch payment methods: ${paymentMethodsResponse.status}`);
      }
      
      const paymentMethodsData = await paymentMethodsResponse.json();
      console.log(`Payment methods for ${currencyCode}:`, paymentMethodsData);
      setAllPaymentMethods(paymentMethodsData);

      // Format the payment methods for display
      const formattedMethods: PaymentOption[] = paymentMethodsData
        .filter((method: ApiPaymentMethod) => method.active)
        .map((method: ApiPaymentMethod) => ({
          value: method.id.toString(),
          label: method.name,
          options: [method.name],
          methodData: method
        }));

      console.log("Formatted payment methods:", formattedMethods);
      setPaymentMethods(formattedMethods);
      
      // Reset selected payment if no longer available
      if (selectedPayment && !formattedMethods.some(method => method.value === selectedPayment)) {
        setSelectedPayment("");
        setSelectedPaymentOption("");
      }

    } catch (err: any) {
      console.error("Error fetching payment methods:", err);
      setError(err.message || "Failed to load payment methods. Please try again.");
      setPaymentMethods([]);
      setAllPaymentMethods([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!selectedPayment || !selectedPaymentOption) {
      setError("Please select a payment method and option");
      return;
    }

    if (!phoneNumber) {
      setError("Please enter your phone number");
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError("Please enter a valid phone number");
      return;
    }

    // Validate amount
    if (totalAmount <= 0) {
      setError("Invalid amount. Please check your support amount.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const selectedMethod = allPaymentMethods.find(method => method.id.toString() === selectedPayment);
      
      if (!selectedMethod) {
        throw new Error("Selected payment method not found");
      }

      // Use provided albumId or generate a fallback
      const finalAlbumId = albumId || generateMockAlbumId();

      // Build required fields object
      const requiredFields: Record<string, string> = {};
      
      // Add phone number to required fields if the payment method requires it
      if (selectedMethod.requiredFields.some(field => field.name === 'customerPhoneNumber')) {
        requiredFields.customerPhoneNumber = phoneNumber;
      }

      // Check if this payment method requires redirect
      if (selectedMethod.redirectRequired) {
        // Redirect payment payload
        const redirectPayload = {
          albumId: finalAlbumId,
          plaqueType: plaqueType,
          amount: totalAmount, // Fixed: using the actual totalAmount
          phone: phoneNumber,
          currencyCode: selectedCurrency,
          albumDetails: {
            name: albumName,
            artist: albumArtist,
            image: albumImage
          }
        };

        console.log("Creating redirect payment with payload:", redirectPayload);
        const response = await PaymentsService.createPurchaseRedirect(redirectPayload);
        console.log("Redirect payment response:", response);
        
        if (response.redirectUrl) {
          // Redirect to payment gateway
          window.location.href = response.redirectUrl;
        } else {
          throw new Error("No redirect URL received from payment service");
        }
      } else {
        // Seamless payment payload
        const seamlessPayload = {
          albumId: finalAlbumId,
          plaqueType: plaqueType,
          amount: totalAmount, // Fixed: using the actual totalAmount
          phone: phoneNumber,
          paymentMethodCode: selectedMethod.code,
          currencyCode: selectedCurrency,
          requiredFields: requiredFields,
          albumDetails: {
            name: albumName,
            artist: albumArtist,
            image: albumImage
          },
          shippingDetails: includeShipping ? {
            includeShipping: true,
            address: shippingAddress,
            instructions: deliveryInstructions,
            contactNumber: callingNumber || phoneNumber
          } : {
            includeShipping: false
          }
        };

        console.log("Creating seamless payment with payload:", seamlessPayload);
        const response = await PaymentsService.createPurchaseSeamless(seamlessPayload);
        console.log("Seamless payment response:", response);
        
        // Handle successful payment initiation based on response
        if (response.paymentInstructions) {
          // Show payment instructions to user
          handleWhatsApp(
            `Payment instructions for ${albumName}: ${response.paymentInstructions}\nAmount: ${selectedCurrency} ${totalAmount}\nPayment Method: ${selectedMethod.name}\nAlbum: ${albumName} by ${albumArtist}`
          );
        } else if (response.referenceNumber) {
          // Start polling for status
          startStatusPolling(response.referenceNumber);
        } else if (response.status === "success" || response.success) {
          // Generic success handling
          console.log("Payment initiated successfully:", response);
          alert("Payment initiated successfully! Please check your payment method for confirmation.");
          onClose(); // Close modal on success
        } else {
          // Generic success handling
          console.log("Payment initiated successfully:", response);
          alert("Payment initiated successfully! Please check your payment method for confirmation.");
        }
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to initiate payment. Please try again or contact support.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to generate mock album ID if not provided
  const generateMockAlbumId = (): string => {
    return `mock-album-${Date.now()}`;
  };
  
  const startStatusPolling = async (referenceNumber: string) => {
    try {
      // Poll for status updates
      const statusResponse = await PaymentsService.getStatus(referenceNumber);
      console.log("Payment status:", statusResponse);
      
      if (statusResponse.status === "completed" || statusResponse.status === "success") {
        alert(`Payment completed successfully for ${albumName}!`);
        onClose();
      } else if (statusResponse.status === "failed") {
        setError("Payment failed. Please try again.");
      } else if (statusResponse.status === "pending") {
        // Continue polling or show pending message
        console.log("Payment is still pending...");
      }
    } catch (err) {
      console.error("Error checking payment status:", err);
    }
  };

  const generateInvoiceNumber = (): string => {
    return `INV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  };

  const handleWhatsApp = (message: string) => {
    const phone = "+263714219938";
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank");
  };

  const handleCashPickup = () => {
    const message = `Hi, I'd like to arrange cash pickup for my order:
Album: ${albumName}
Artist: ${albumArtist}
Amount: ${selectedCurrency} ${totalAmount.toFixed(2)}
Invoice: ${generateInvoiceNumber()}
${includeShipping ? `Shipping Address: ${shippingAddress}` : 'No shipping required'}`;
    
    handleWhatsApp(message);
  };

  const handleOtherPaymentMethod = () => {
    const message = `Hi, I don't see my preferred payment method for:
Album: ${albumName}
Artist: ${albumArtist}
Amount: ${selectedCurrency} ${totalAmount.toFixed(2)}
Invoice: ${generateInvoiceNumber()}
Can you help me with alternative payment options?`;
    
    handleWhatsApp(message);
  };

  if (!isOpen) return null;

  const invoiceNumber = generateInvoiceNumber();

  const selectedMethod = paymentMethods.find(
    (m) => m.value === selectedPayment
  );

  // Check if selected method requires phone number
  const requiresPhoneNumber = selectedMethod?.methodData?.requiredFields?.some(
    field => field.name === 'customerPhoneNumber' && !field.optional
  );

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
                disabled={isLoading}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
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
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm">{error}</p>
                <button
                  onClick={() => selectedCurrency ? fetchPaymentMethodsForCurrency(selectedCurrency) : fetchCurrencies()}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading State */}
            {isInitializing && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-blue-700 text-sm">Loading payment methods...</p>
              </div>
            )}

            {/* No Payment Methods Available */}
            {!isInitializing && paymentMethods.length === 0 && !error && selectedCurrency && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-yellow-700 text-sm">No payment methods available for {selectedCurrency} at the moment. Please try another currency or contact support.</p>
              </div>
            )}

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
                      {albumId && (
                        <p className="text-xs text-gray-500 mt-1">
                          Album ID: {albumId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Currency Selection */}
                {currencies.length > 0 && (
                  <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                      Select Currency
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {currencies.map((currency) => (
                        <button
                          key={currency.id}
                          onClick={() => setSelectedCurrency(currency.code)}
                          disabled={isLoading}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedCurrency === currency.code
                              ? "bg-green-600 text-white shadow-md"
                              : "bg-white text-gray-700 border border-gray-200 hover:border-green-500"
                          } disabled:opacity-50`}
                        >
                          {currency.code} 
                          {currency.defaultCurrency && " ★"}
                        </button>
                      ))}
                    </div>
                    {selectedCurrency && (
                      <p className="text-xs text-gray-500 mt-3">
                        Selected: {selectedCurrency}
                        {currencies.find(c => c.code === selectedCurrency)?.defaultCurrency && " (Default Currency)"}
                      </p>
                    )}
                  </div>
                )}

                {/* No Currencies Available */}
                {!isInitializing && currencies.length === 0 && !error && (
                  <div className="bg-yellow-50 p-4 sm:p-5 rounded-2xl">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                      Select Currency
                    </h3>
                    <p className="text-yellow-700 text-sm">No currencies available at the moment.</p>
                  </div>
                )}

                {/* Phone Number Input */}
                <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                    Contact Information
                  </h3>
                  <input
                    type="tel"
                    placeholder="Phone number (e.g., +263771234567)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm disabled:opacity-50"
                  />
                  {requiresPhoneNumber && (
                    <p className="text-xs text-blue-600 mt-2">
                      Phone number is required for {selectedMethod?.label}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    We'll use this number for payment confirmation and shipping updates
                  </p>
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
                        {selectedCurrency} {supportAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="shipping"
                          checked={includeShipping}
                          onChange={(e) => setIncludeShipping(e.target.checked)}
                          disabled={isLoading}
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
                        {selectedCurrency} {shippingCost.toFixed(2)}
                      </span>
                    </div>

                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-bold text-gray-900">
                          Total
                        </span>
                        <span className="text-2xl font-bold text-green-600">
                          {selectedCurrency} {totalAmount.toFixed(2)}
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
                        disabled={isLoading}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm disabled:opacity-50"
                      />
                      <input
                        type="text"
                        placeholder="Delivery instructions (optional)"
                        value={deliveryInstructions}
                        onChange={(e) =>
                          setDeliveryInstructions(e.target.value)
                        }
                        disabled={isLoading}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm disabled:opacity-50"
                      />
                      <input
                        type="tel"
                        placeholder="Contact number (optional)"
                        value={callingNumber}
                        onChange={(e) => setCallingNumber(e.target.value)}
                        disabled={isLoading}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm disabled:opacity-50"
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
                      disabled={isLoading || paymentMethods.length === 0}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-left flex items-center justify-between hover:border-green-500 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 text-sm disabled:opacity-50"
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
                          : paymentMethods.length === 0
                          ? "No payment methods available"
                          : "Select payment method"}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          showDropdown ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {showDropdown && paymentMethods.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden max-h-60 overflow-y-auto">
                        {paymentMethods.map((method) => (
                          <button
                            key={method.value}
                            onClick={() => {
                              setSelectedPayment(method.value);
                              setSelectedPaymentOption(method.options[0]);
                              setShowDropdown(false);
                            }}
                            disabled={isLoading}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm ${
                              selectedPayment === method.value
                                ? "bg-green-50 text-green-700 font-medium"
                                : "text-gray-900"
                            } disabled:opacity-50`}
                          >
                            {method.label}
                            {method.methodData?.redirectRequired && (
                              <span className="text-xs text-blue-600 ml-2">(Redirect)</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Payment Options */}
                  {selectedMethod && selectedMethod.options.length > 0 && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-600 mb-3 font-medium">
                        Selected payment method:
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {selectedMethod.options.map((option) => (
                          <button
                            key={option}
                            onClick={() => setSelectedPaymentOption(option)}
                            disabled={isLoading}
                            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                              selectedPaymentOption === option
                                ? "bg-green-600 text-white shadow-md"
                                : "bg-white text-gray-700 border border-gray-200 hover:border-green-500"
                            } disabled:opacity-50`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Method Details */}
                  {selectedPayment && (
                    <div className="mt-4 bg-blue-50 p-4 rounded-xl">
                      <p className="text-xs text-blue-700">
                        <strong>Selected:</strong> {selectedMethod?.label}
                        {selectedMethod?.methodData?.description && 
                          ` - ${selectedMethod.methodData.description}`
                        }
                        {selectedMethod?.methodData?.redirectRequired && (
                          <span className="block mt-1 text-blue-600 font-medium">
                            This method will redirect you to complete payment
                          </span>
                        )}
                        {selectedMethod?.methodData?.processingPaymentMessage && (
                          <span className="block mt-1 text-green-600 text-xs">
                            {selectedMethod.methodData.processingPaymentMessage}
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleProceedToPayment}
                    disabled={!selectedPayment || !selectedPaymentOption || isLoading || paymentMethods.length === 0 || !phoneNumber}
                    className="w-full py-3.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base disabled:transform-none"
                  >
                    {isLoading ? "Processing..." : "Proceed to Payment"}
                  </button>

                  <button
                    onClick={handleCashPickup}
                    disabled={isLoading}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl transition-all duration-200 text-sm disabled:opacity-50"
                  >
                    Cash Pickup
                  </button>

                  <button
                    onClick={handleOtherPaymentMethod}
                    disabled={isLoading}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl transition-all duration-200 text-sm disabled:opacity-50"
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