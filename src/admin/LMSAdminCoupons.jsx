
import { useCallback, useEffect, useState } from "react";
import {
    getAdminCoupons,
    createAdminCoupon,
} from "../api/lms";

const initialForm = {
    code: "",
    discountType: "percentage",
    discountValue: "",
    maxDiscount: "0",
    minPurchaseAmount: "0",
    courseId: "",
    usageLimit: "0",
    endDate: "",
};

function findArray(payload, depth = 0) {
    if (Array.isArray(payload)) return payload;

    if (
        !payload ||
        typeof payload !== "object" ||
        depth > 6
    ) {
        return null;
    }

    for (const key of ["coupons", "items", "results"]) {
        if (Array.isArray(payload[key])) {
            return payload[key];
        }
    }

    for (const value of Object.values(payload)) {
        if (value && typeof value === "object") {
            const result = findArray(value, depth + 1);

            if (result !== null) return result;
        }
    }

    return null;
}

function couponId(coupon) {
    return coupon?._id ?? coupon?.id ?? coupon?.couponId;
}

function idFrom(value) {
    if (typeof value === "string" || typeof value === "number") {
        return String(value);
    }

    return value?._id ?? value?.id ?? value?.courseId ?? "";
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? String(value)
        : date.toLocaleString("en-IN");
}

function getErrorMessage(error) {
    if (error.response?.status === 401) {
        return "Please log in again to access coupons.";
    }

    if (error.response?.status === 403) {
        return "Admin permission is required to manage coupons.";
    }

    return (
        error.response?.data?.message ||
        "Unable to complete the coupon request."
    );
}

export default function LMSAdminCoupons() {
    const [coupons, setCoupons] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const loadCoupons = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getAdminCoupons();
            const list = findArray(response);

            if (list === null) {
                setCoupons([]);
                setError(
                    "The API response did not contain a recognizable coupon list."
                );
                return;
            }

            setCoupons(list);
        } catch (err) {
            console.error(
                "Load coupons error:",
                err.response?.data || err.message
            );

            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCoupons();
    }, [loadCoupons]);

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setNotice("");

        const discountValue = Number(form.discountValue);
        const maxDiscount = Number(form.maxDiscount);
        const minPurchaseAmount = Number(form.minPurchaseAmount);
        const usageLimit = Number(form.usageLimit);

        if (!form.code.trim()) {
            setError("Enter a coupon code.");
            return;
        }

        if (!form.courseId.trim()) {
            setError("Enter the course ID for this coupon.");
            return;
        }

        if (
            form.discountValue === "" ||
            !Number.isFinite(discountValue) ||
            discountValue <= 0
        ) {
            setError("Discount value must be greater than zero.");
            return;
        }

        if (
            !Number.isFinite(maxDiscount) ||
            maxDiscount < 0 ||
            !Number.isFinite(minPurchaseAmount) ||
            minPurchaseAmount < 0 ||
            !Number.isFinite(usageLimit) ||
            usageLimit < 0
        ) {
            setError(
                "Maximum discount, minimum purchase and usage limit must be zero or positive."
            );
            return;
        }

        if (!form.endDate) {
            setError("Choose a coupon expiry date and time.");
            return;
        }

        const endDate = new Date(form.endDate);

        if (
            Number.isNaN(endDate.getTime()) ||
            endDate.getTime() <= Date.now()
        ) {
            setError("The expiry date must be in the future.");
            return;
        }

        const payload = {
            code: form.code.trim().toUpperCase(),
            discountType: form.discountType,
            discountValue,
            maxDiscount,
            minPurchaseAmount,
            courseId: form.courseId.trim(),
            usageLimit,
            endDate: endDate.toISOString(),
        };

        try {
            setSaving(true);

            await createAdminCoupon(payload);

            setNotice("Coupon created successfully.");
            setForm(initialForm);

            await loadCoupons();
        } catch (err) {
            console.error(
                "Create coupon error:",
                err.response?.data || err.message
            );

            setError(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    }

    return (
        <main className="kk-coupon-admin">
            <style>{`
                .kk-coupon-admin {
                    min-height: 100%;
                    padding: 28px;
                    background: #f7f5ec;
                    color: #263522;
                    font-family: Inter, -apple-system, BlinkMacSystemFont,
                        "Segoe UI", sans-serif;
                    box-sizing: border-box;
                }

                .kk-coupon-admin *,
                .kk-coupon-admin *::before,
                .kk-coupon-admin *::after {
                    box-sizing: border-box;
                }

                .kk-coupon-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 16px;
                    flex-wrap: wrap;
                    margin-bottom: 26px;
                }

                .kk-coupon-eyebrow {
                    margin: 0 0 8px;
                    color: #628141;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 1.7px;
                }

                .kk-coupon-header h1 {
                    margin: 0 0 8px;
                    color: #263522;
                    font-size: clamp(26px, 3vw, 36px);
                    font-weight: 800;
                    letter-spacing: -.7px;
                }

                .kk-coupon-subtitle {
                    margin: 0;
                    color: #73796d;
                    font-size: 13px;
                    line-height: 1.6;
                }

                .kk-coupon-panel {
                    margin-bottom: 24px;
                    padding: clamp(18px, 2.5vw, 28px);
                    border: 1px solid #dce5d2;
                    border-radius: 16px;
                    background: #fffdf7;
                    box-shadow: 0 5px 18px rgba(38, 53, 34, .04);
                }

                .kk-coupon-panel h2 {
                    margin: 0 0 20px;
                    color: #263522;
                    font-size: 20px;
                    font-weight: 800;
                }

                .kk-coupon-form {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 17px;
                }

                .kk-coupon-field {
                    display: flex;
                    flex-direction: column;
                    gap: 7px;
                    min-width: 0;
                }

                .kk-coupon-field.full {
                    grid-column: 1 / -1;
                }

                .kk-coupon-field label {
                    color: #53604b;
                    font-size: 12px;
                    font-weight: 750;
                }

                .kk-coupon-field input,
                .kk-coupon-field select {
                    width: 100%;
                    min-height: 43px;
                    padding: 11px 12px;
                    border: 1px solid #d6dfcb;
                    border-radius: 9px;
                    background: #fbfcf9;
                    color: #263522;
                    font: inherit;
                    font-size: 13px;
                }

                .kk-coupon-help {
                    margin: 0;
                    color: #83897b;
                    font-size: 11px;
                    line-height: 1.5;
                }

                .kk-coupon-button {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 42px;
                    padding: 10px 16px;
                    border: 1px solid #628141;
                    border-radius: 9px;
                    background: #628141;
                    color: white;
                    font: inherit;
                    font-size: 12px;
                    font-weight: 800;
                    cursor: pointer;
                }

                .kk-coupon-button:hover {
                    background: #405538;
                }

                .kk-coupon-button.secondary {
                    border-color: #d6dfcb;
                    background: #fffdf7;
                    color: #405538;
                }

                .kk-coupon-button:disabled {
                    opacity: .6;
                    cursor: wait;
                }

                .kk-coupon-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-top: 20px;
                }

                .kk-coupon-message {
                    margin: 0 0 18px;
                    padding: 13px 15px;
                    border: 1px solid #e8c9c2;
                    border-radius: 9px;
                    background: #fff4f0;
                    color: #963b2d;
                    font-size: 13px;
                    line-height: 1.6;
                }

                .kk-coupon-message.success {
                    border-color: #d7e3cd;
                    background: #f0f5e9;
                    color: #496438;
                }

                .kk-coupon-count {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 31px;
                    height: 29px;
                    padding: 0 9px;
                    border-radius: 20px;
                    background: #edf2e5;
                    color: #506a3c;
                    font-size: 12px;
                    font-weight: 800;
                }

                .kk-coupon-table-wrap {
                    width: 100%;
                    overflow-x: auto;
                }

                .kk-coupon-table {
                    width: 100%;
                    min-width: 720px;
                    border-collapse: collapse;
                    text-align: left;
                }

                .kk-coupon-table th {
                    padding: 13px 12px;
                    border-bottom: 1px solid #dce5d2;
                    color: #68715f;
                    font-size: 11px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: .5px;
                }

                .kk-coupon-table td {
                    padding: 15px 12px;
                    border-bottom: 1px solid #edf0e8;
                    color: #34402e;
                    font-size: 12px;
                    vertical-align: top;
                }

                .kk-coupon-code {
                    display: inline-block;
                    padding: 6px 9px;
                    border: 1px dashed #a9bf98;
                    border-radius: 7px;
                    background: #f1f5eb;
                    color: #405538;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: .4px;
                }

                .kk-coupon-empty {
                    padding: 25px;
                    border: 1.5px dashed #cfdbc4;
                    border-radius: 12px;
                    background: #f8faf5;
                    color: #737d6b;
                    text-align: center;
                    font-size: 13px;
                    line-height: 1.7;
                }

                @media (max-width: 650px) {
                    .kk-coupon-admin {
                        padding: 18px 13px;
                    }

                    .kk-coupon-form {
                        grid-template-columns: 1fr;
                    }

                    .kk-coupon-field.full {
                        grid-column: auto;
                    }
                }
            `}</style>

            <header className="kk-coupon-header">
                <div>
                    <p className="kk-coupon-eyebrow">
                        KITABIKEEDA / LMS ADMIN
                    </p>

                    <h1>Coupon Management</h1>

                    <p className="kk-coupon-subtitle">
                        Create coupons and view existing coupon records.
                    </p>
                </div>

                <button
                    type="button"
                    className="kk-coupon-button secondary"
                    onClick={loadCoupons}
                    disabled={loading}
                >
                    {loading ? "Refreshing..." : "Refresh Coupons"}
                </button>
            </header>

            {error && (
                <div className="kk-coupon-message" role="alert">
                    {error}
                </div>
            )}

            {notice && (
                <div
                    className="kk-coupon-message success"
                    role="status"
                >
                    {notice}
                </div>
            )}

            <section className="kk-coupon-panel">
                <h2>Create Coupon</h2>

                <form onSubmit={handleSubmit}>
                    <div className="kk-coupon-form">
                        <div className="kk-coupon-field">
                            <label htmlFor="coupon-code">
                                Coupon Code *
                            </label>

                            <input
                                id="coupon-code"
                                name="code"
                                value={form.code}
                                onChange={handleChange}
                                placeholder="e.g. LEARN20"
                                maxLength={60}
                                required
                            />
                        </div>

                        <div className="kk-coupon-field">
                            <label htmlFor="coupon-course-id">
                                Course ID *
                            </label>

                            <input
                                id="coupon-course-id"
                                name="courseId"
                                value={form.courseId}
                                onChange={handleChange}
                                placeholder="Course ID from the API"
                                required
                            />
                        </div>

                        <div className="kk-coupon-field">
                            <label htmlFor="coupon-discount-type">
                                Discount Type *
                            </label>

                            <select
                                id="coupon-discount-type"
                                name="discountType"
                                value={form.discountType}
                                onChange={handleChange}
                                required
                            >
                                <option value="percentage">
                                    Percentage
                                </option>
                                <option value="fixed">
                                    Fixed amount
                                </option>
                            </select>
                            <p className="kk-coupon-help">
                                Choose the discount type supported by your backend.
                            </p>
                        </div>

                        <div className="kk-coupon-field">
                            <label htmlFor="coupon-discount-value">
                                Discount Value *
                            </label>

                            <input
                                id="coupon-discount-value"
                                name="discountValue"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={form.discountValue}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="kk-coupon-field">
                            <label htmlFor="coupon-max-discount">
                                Maximum Discount
                            </label>

                            <input
                                id="coupon-max-discount"
                                name="maxDiscount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.maxDiscount}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="kk-coupon-field">
                            <label htmlFor="coupon-min-purchase">
                                Minimum Purchase Amount
                            </label>

                            <input
                                id="coupon-min-purchase"
                                name="minPurchaseAmount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.minPurchaseAmount}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="kk-coupon-field">
                            <label htmlFor="coupon-usage-limit">
                                Usage Limit
                            </label>

                            <input
                                id="coupon-usage-limit"
                                name="usageLimit"
                                type="number"
                                min="0"
                                step="1"
                                value={form.usageLimit}
                                onChange={handleChange}
                            />
                            <p className="kk-coupon-help">
                                Enter 0 if you intend to use the API's zero-limit behavior.
                            </p>
                        </div>

                        <div className="kk-coupon-field">
                            <label htmlFor="coupon-end-date">
                                Expiry Date & Time *
                            </label>

                            <input
                                id="coupon-end-date"
                                name="endDate"
                                type="datetime-local"
                                value={form.endDate}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="kk-coupon-actions">
                        <button
                            className="kk-coupon-button"
                            type="submit"
                            disabled={saving}
                        >
                            {saving ? "Creating..." : "Create Coupon"}
                        </button>

                        <button
                            className="kk-coupon-button secondary"
                            type="button"
                            disabled={saving}
                            onClick={() => {
                                setForm(initialForm);
                                setError("");
                                setNotice("");
                            }}
                        >
                            Clear Form
                        </button>
                    </div>
                </form>
            </section>

            <section className="kk-coupon-panel">
                <h2>
                    Existing Coupons{" "}
                    <span className="kk-coupon-count">
                        {coupons.length}
                    </span>
                </h2>

                {loading ? (
                    <div className="kk-coupon-empty">
                        Loading coupon records...
                    </div>
                ) : coupons.length === 0 ? (
                    <div className="kk-coupon-empty">
                        No coupon records were returned by the API.
                    </div>
                ) : (
                    <div className="kk-coupon-table-wrap">
                        <table className="kk-coupon-table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Discount</th>
                                    <th>Course ID</th>
                                    <th>Minimum Purchase</th>
                                    <th>Usage Limit</th>
                                    <th>Expires</th>
                                </tr>
                            </thead>

                            <tbody>
                                {coupons.map((coupon, index) => (
                                    <tr
                                        key={couponId(coupon) || index}
                                    >
                                        <td>
                                            <span className="kk-coupon-code">
                                                {coupon.code || "—"}
                                            </span>
                                        </td>

                                        <td>
                                            {coupon.discountValue ?? "—"}
                                            {coupon.discountType === "percentage"
                                                ? "%"
                                                : coupon.discountType
                                                  ? ` (${coupon.discountType})`
                                                  : ""}
                                        </td>

                                        <td>
                                            {idFrom(coupon.courseId) || "—"}
                                        </td>

                                        <td>
                                            {coupon.minPurchaseAmount == null
                                                ? "—"
                                                : `₹${coupon.minPurchaseAmount}`}
                                        </td>

                                        <td>
                                            {coupon.usageLimit ?? "—"}
                                        </td>

                                        <td>
                                            {formatDate(coupon.endDate)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
}
