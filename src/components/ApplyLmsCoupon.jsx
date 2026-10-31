
// import { useState } from "react";
// import { validateLmsCoupon } from "../api/lms";

// function formatMoney(value) {
//     const amount = Number(value);

//     return Number.isFinite(amount)
//         ? `₹${amount.toLocaleString("en-IN", {
//               maximumFractionDigits: 2,
//           })}`
//         : "—";
// }

// function unwrapResponse(response) {
//     return response?.data?.data ?? response?.data ?? response ?? {};
// }

// export default function ApplyLmsCoupon({
//     courseId,
//     coursePrice,
//     onCouponValidated,
// }) {
//     const [code, setCode] = useState("");
//     const [result, setResult] = useState(null);
//     const [error, setError] = useState("");
//     const [loading, setLoading] = useState(false);

//     async function handleSubmit(event) {
//         event.preventDefault();
//         setError("");
//         setResult(null);

//         if (!courseId) {
//             setError("Course ID is missing.");
//             return;
//         }

//         if (!code.trim()) {
//             setError("Enter a coupon code.");
//             return;
//         }

//         try {
//             setLoading(true);

//             const response = await validateLmsCoupon(
//                 code.trim(),
//                 courseId
//             );

//             const data = unwrapResponse(response);

//             if (
//                 data.discount == null ||
//                 data.payable == null
//             ) {
//                 throw new Error(
//                     "The server did not return discount and payable amounts."
//                 );
//             }

//             const validated = {
//                 code: code.trim().toUpperCase(),
//                 courseId,
//                 discount: data.discount,
//                 payable: data.payable,
//             };

//             setResult(validated);
//             onCouponValidated?.(validated);
//         } catch (err) {
//             console.error(
//                 "Coupon validation failed:",
//                 err.response?.data || err.message
//             );

//             setError(
//                 err.response?.data?.message ||
//                 err.message ||
//                 "Unable to validate this coupon."
//             );

//             onCouponValidated?.(null);
//         } finally {
//             setLoading(false);
//         }
//     }

//     function handleClear() {
//         setCode("");
//         setResult(null);
//         setError("");
//         onCouponValidated?.(null);
//     }

//     return (
//         <section className="kk-apply-coupon">
//             <style>{`
//                 .kk-apply-coupon {
//                     margin-top: 22px;
//                     padding: 20px;
//                     border: 1px solid #dce5d2;
//                     border-radius: 14px;
//                     background: #fffdf7;
//                     color: #263522;
//                     font-family: inherit;
//                 }

//                 .kk-apply-coupon h3 {
//                     margin: 0 0 7px;
//                     font-size: 18px;
//                     font-weight: 800;
//                 }

//                 .kk-apply-coupon p {
//                     color: #73796d;
//                     font-size: 13px;
//                     line-height: 1.6;
//                 }

//                 .kk-coupon-input-row {
//                     display: flex;
//                     flex-wrap: wrap;
//                     gap: 10px;
//                     margin-top: 15px;
//                 }

//                 .kk-coupon-input {
//                     flex: 1;
//                     min-width: 150px;
//                     min-height: 44px;
//                     padding: 11px 13px;
//                     border: 1px solid #d6dfcb;
//                     border-radius: 9px;
//                     background: #fbfcf9;
//                     color: #263522;
//                     font: inherit;
//                 }

//                 .kk-coupon-action {
//                     min-height: 44px;
//                     padding: 10px 17px;
//                     border: 1px solid #628141;
//                     border-radius: 9px;
//                     background: #628141;
//                     color: white;
//                     font: inherit;
//                     font-size: 13px;
//                     font-weight: 800;
//                     cursor: pointer;
//                 }

//                 .kk-coupon-action.secondary {
//                     border-color: #d6dfcb;
//                     background: #fffdf7;
//                     color: #405538;
//                 }

//                 .kk-coupon-action:disabled {
//                     opacity: .6;
//                     cursor: wait;
//                 }

//                 .kk-coupon-error {
//                     margin-top: 12px;
//                     color: #963b2d !important;
//                 }

//                 .kk-coupon-success {
//                     margin-top: 16px;
//                     padding: 15px;
//                     border: 1px solid #d7e3cd;
//                     border-radius: 10px;
//                     background: #f0f5e9;
//                 }

//                 .kk-coupon-price-row {
//                     display: flex;
//                     align-items: center;
//                     justify-content: space-between;
//                     gap: 12px;
//                     margin-top: 10px;
//                     font-size: 13px;
//                 }

//                 .kk-coupon-price-row strong {
//                     color: #405538;
//                 }

//                 .kk-coupon-payable {
//                     padding-top: 10px;
//                     border-top: 1px solid #d7e3cd;
//                     font-size: 15px;
//                     font-weight: 800;
//                 }
//             `}</style>

//             <h3>Have a coupon?</h3>
//             <p>Enter your coupon code to check whether it is valid for this course.</p>

//             <form onSubmit={handleSubmit}>
//                 <div className="kk-coupon-input-row">
//                     <input
//                         className="kk-coupon-input"
//                         type="text"
//                         value={code}
//                         onChange={(event) => setCode(event.target.value)}
//                         placeholder="Enter coupon code"
//                         aria-label="Coupon code"
//                         autoComplete="off"
//                         required
//                     />

//                     <button
//                         className="kk-coupon-action"
//                         type="submit"
//                         disabled={loading || !courseId}
//                     >
//                         {loading ? "Checking..." : "Apply Coupon"}
//                     </button>

//                     {(result || error) && (
//                         <button
//                             className="kk-coupon-action secondary"
//                             type="button"
//                             onClick={handleClear}
//                         >
//                             Clear
//                         </button>
//                     )}
//                 </div>
//             </form>

//             {error && (
//                 <p className="kk-coupon-error" role="alert">
//                     {error}
//                 </p>
//             )}

//             {result && (
//                 <div className="kk-coupon-success" role="status">
//                     <strong>Coupon {result.code} validated</strong>

//                     <div className="kk-coupon-price-row">
//                         <span>Course price</span>
//                         <span>{formatMoney(coursePrice)}</span>
//                     </div>

//                     <div className="kk-coupon-price-row">
//                         <span>Discount</span>
//                         <strong>
//                             − {formatMoney(result.discount)}
//                         </strong>
//                     </div>

//                     <div className="kk-coupon-price-row kk-coupon-payable">
//                         <span>Payable amount</span>
//                         <strong>{formatMoney(result.payable)}</strong>
//                     </div>

//                     <p>
//                         Discount and payable amounts are provided by the server.
//                     </p>
//                 </div>
//             )}
//         </section>
//     );
// }
