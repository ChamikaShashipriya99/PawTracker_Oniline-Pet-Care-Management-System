$files = @(
    "client/src/components/Payment.css",
    "client/src/components/PaymentCheckout.js",
    "client/src/components/PaymentConfirmation.js",
    "client/src/components/PaymentHistory.js",
    "client/src/components/PaymentMethodForm.js",
    "client/src/components/PaymentOTPPage.js",
    "client/src/components/PersonalInfoForm.js",
    "client/src/components/Cart.js",
    "client/src/components/ProductView.js",
    "client/src/components/Store.js",
    "server/controllers/paymentController.js",
    "server/controllers/refundController.js",
    "server/models/Payment.js",
    "server/models/Refund.js",
    "server/routes/payment.js",
    "server/routes/refund.js",
    "server/routes/storeRoutes.js"
)

foreach ($file in $files) {
    git checkout temp-payment -- $file
} 