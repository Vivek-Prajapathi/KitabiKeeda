
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Styles from "./AdminLayout.module.css";


const API_BASE = "https://mockapi-mauve.vercel.app/api/v1";

const layoutAPI = axios.create({
    baseURL: `${API_BASE}/layout`,
    headers: {
        "Content-Type": "application/json",
    },
});

/* ---------------- AUTH TOKEN ---------------- */

layoutAPI.interceptors.request.use(
    (config) => {
        const token =
            localStorage.getItem("token") ||
            localStorage.getItem("TOKEN");

        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

/* ---------------- CONSTANTS ---------------- */

const TABS = ["banner", "faq", "categories"];

const FORMS = {
    banner: BannerForm,
    faq: FaqForm,
    categories: CategoriesForm,
};

/* ---------------- HELPERS ---------------- */

function getMessage(error) {
    return (
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Something went wrong."
    );
}

function getLayoutData(response) {
    const data = response?.data;

    // API response: { success: true, layout: {...} }
    if (data?.layout) {
        return data.layout;
    }

    if (data?.data?.layout) {
        return data.data.layout;
    }

    return data?.data ?? data ?? null;
}

/* ---------------- API FUNCTIONS ---------------- */

async function getLayout(type) {
    const response = await layoutAPI.get("/get-layout", {
        params: { type },
    });

    return getLayoutData(response);
}

async function createLayout(body) {
    return layoutAPI.post("/create-layout", body);
}

async function updateLayout(body) {
    return layoutAPI.put("/update-layout", body);
}

/* ---------------- LOAD LAYOUT ---------------- */

function useLayout(type) {
    const [state, setState] = useState({
        loading: true,
        layout: null,
    });

    const reload = useCallback(async () => {
        setState((previous) => ({
            ...previous,
            loading: true,
        }));

        try {
            const layout = await getLayout(type);

            setState({
                loading: false,
                layout,
            });
        } catch (error) {
            const status = error.response?.status;
            const message =
                error.response?.data?.message || "";

            // No saved layout yet is a valid state.
            if (
                [400, 404].includes(status) &&
                message.toLowerCase().includes("does not exist")
            ) {
                setState({
                    loading: false,
                    layout: null,
                });

                return;
            }

            console.error(
                `Failed to load ${type} layout:`,
                error.response?.data || error.message
            );

            setState({
                loading: false,
                layout: null,
            });
        }
    }, [type]);

    useEffect(() => {
        reload();
    }, [reload]);

    return {
        ...state,
        reload,
    };
}

/* ---------------- SAVE HELPERS ---------------- */

function layoutExists(layout) {
    return Boolean(
        layout &&
        typeof layout === "object" &&
        Object.keys(layout).length > 0
    );
}

async function saveLayout(body, exists) {
    const primary = exists ? updateLayout : createLayout;
    const secondary = exists ? createLayout : updateLayout;

    try {
        return await primary(body);
    } catch (error) {
        const status = error.response?.status;

        // Try the alternative only for possible create/update conflicts.
        if ([400, 404, 409].includes(status)) {
            return secondary(body);
        }

        throw error;
    }
}

function useSave(type, layout, reload) {
    const [saving, setSaving] = useState(false);

    const save = async (body) => {
        try {
            setSaving(true);

            const token =
                localStorage.getItem("token") ||
                localStorage.getItem("TOKEN");

            if (!token) {
                toast.error(
                    "Please log in again before saving."
                );
                return;
            }

            await saveLayout(
                {
                    type,
                    ...body,
                },
                layoutExists(layout)
            );

            toast.success(`${type} saved successfully`);

            await reload();
        } catch (error) {
            console.error(
                `Failed to save ${type}:`,
                error.response?.data || error.message
            );

            if (error.response?.status === 401) {
                toast.error(
                    "Session expired or token is invalid. Please log in again."
                );
            } else {
                toast.error(getMessage(error));
            }
        } finally {
            setSaving(false);
        }
    };

    return {
        saving,
        save,
    };
}

/* ==================================================
   BANNER FORM
================================================== */

function BannerForm({ layout, reload }) {
    const banner = layout?.banner ?? layout ?? {};

    const [title, setTitle] = useState(
        banner.title || ""
    );

    const [subTitle, setSubTitle] = useState(
        banner.subTitle || ""
    );

    const [image, setImage] = useState(
        typeof banner.image === "string"
            ? banner.image
            : banner.image?.url || ""
    );

    const { saving, save } = useSave(
        "banner",
        layout,
        reload
    );

    const onFile = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please choose an image file.");
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be smaller than 5 MB.");
            event.target.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            setImage(String(reader.result));
        };

        reader.onerror = () => {
            toast.error("Unable to read the image.");
        };

        reader.readAsDataURL(file);
    };

    const submit = (event) => {
        event.preventDefault();

        if (!title.trim()) {
            toast.error("Title is required.");
            return;
        }

        if (!image) {
            toast.error("Banner image is required.");
            return;
        }

        save({
            image,
            title: title.trim(),
            subTitle: subTitle.trim(),
        });
    };

    return (
        <form
            className={Styles.form}
            onSubmit={submit}
        >
            <div className={Styles.field}>
                <label htmlFor="banner-title">
                    Title
                </label>

                <input
                    id="banner-title"
                    type="text"
                    value={title}
                    onChange={(event) =>
                        setTitle(event.target.value)
                    }
                    required
                />
            </div>

            <div className={Styles.field}>
                <label htmlFor="banner-subtitle">
                    Subtitle
                </label>

                <textarea
                    id="banner-subtitle"
                    value={subTitle}
                    onChange={(event) =>
                        setSubTitle(event.target.value)
                    }
                />
            </div>

            <div className={Styles.field}>
                <label htmlFor="banner-image">
                    Image
                </label>

                <input
                    id="banner-image"
                    type="file"
                    accept="image/*"
                    onChange={onFile}
                />

                {image && (
                    <img
                        className={Styles.preview}
                        src={image}
                        alt="Banner preview"
                        style={{
                            display: "block",
                            maxWidth: "100%",
                            maxHeight: "220px",
                            marginTop: "12px",
                            objectFit: "contain",
                        }}
                    />
                )}
            </div>

            <div className={Styles.actions}>
                <button
                    className={Styles.btn}
                    type="submit"
                    disabled={saving}
                >
                    {saving
                        ? "Saving..."
                        : "Save banner"}
                </button>
            </div>
        </form>
    );
}

/* ==================================================
   FAQ FORM
================================================== */

function FaqForm({ layout, reload }) {
    const [items, setItems] = useState(
        () =>
            (layout?.faq || []).map((item) => ({
                question: item.question || "",
                answer: item.answer || "",
            }))
    );

    const { saving, save } = useSave(
        "faq",
        layout,
        reload
    );

    const update = (index, patch) => {
        setItems((previous) =>
            previous.map((item, itemIndex) =>
                itemIndex === index
                    ? { ...item, ...patch }
                    : item
            )
        );
    };

    const submit = (event) => {
        event.preventDefault();

        const faq = items
            .map((item) => ({
                question: item.question.trim(),
                answer: item.answer.trim(),
            }))
            .filter(
                (item) =>
                    item.question && item.answer
            );

        if (!faq.length) {
            toast.error(
                "Add at least one question and answer."
            );
            return;
        }

        save({ faq });
    };

    return (
        <form
            className={Styles.form}
            onSubmit={submit}
        >
            {items.map((item, index) => (
                <div
                    className={Styles.faqBox}
                    key={index}
                >
                    <div>
                        <input
                            type="text"
                            placeholder="Question"
                            value={item.question}
                            onChange={(event) =>
                                update(index, {
                                    question:
                                        event.target.value,
                                })
                            }
                        />

                        <textarea
                            placeholder="Answer"
                            value={item.answer}
                            onChange={(event) =>
                                update(index, {
                                    answer:
                                        event.target.value,
                                })
                            }
                        />
                    </div>

                    <button
                        type="button"
                        className={`${Styles.btn} ${Styles.btnDanger}`}
                        onClick={() =>
                            setItems((previous) =>
                                previous.filter(
                                    (_, itemIndex) =>
                                        itemIndex !== index
                                )
                            )
                        }
                    >
                        Remove
                    </button>
                </div>
            ))}

            <div className={Styles.actions}>
                <button
                    type="button"
                    className={`${Styles.btn} ${Styles.btnGhost}`}
                    onClick={() =>
                        setItems((previous) => [
                            ...previous,
                            {
                                question: "",
                                answer: "",
                            },
                        ])
                    }
                >
                    + Add question
                </button>

                <button
                    className={Styles.btn}
                    type="submit"
                    disabled={saving}
                >
                    {saving
                        ? "Saving..."
                        : "Save FAQ"}
                </button>
            </div>
        </form>
    );
}

/* ==================================================
   CATEGORIES FORM
================================================== */

function CategoriesForm({ layout, reload }) {
    const [items, setItems] = useState(
        () =>
            (layout?.categories || []).map((item) => ({
                title: item.title || "",
            }))
    );

    const { saving, save } = useSave(
        "categories",
        layout,
        reload
    );

    const submit = (event) => {
        event.preventDefault();

        const categories = items
            .map((item) => ({
                title: item.title.trim(),
            }))
            .filter((item) => item.title);

        if (!categories.length) {
            toast.error(
                "Add at least one category."
            );
            return;
        }

        save({ categories });
    };

    return (
        <form
            className={Styles.form}
            onSubmit={submit}
        >
            {items.map((item, index) => (
                <div
                    className={Styles.itemRow}
                    key={index}
                >
                    <input
                        type="text"
                        placeholder="Category title"
                        value={item.title}
                        onChange={(event) =>
                            setItems((previous) =>
                                previous.map(
                                    (category, categoryIndex) =>
                                        categoryIndex === index
                                            ? {
                                                  title: event.target.value,
                                              }
                                            : category
                                )
                            )
                        }
                    />

                    <button
                        type="button"
                        className={`${Styles.btn} ${Styles.btnDanger}`}
                        onClick={() =>
                            setItems((previous) =>
                                previous.filter(
                                    (_, itemIndex) =>
                                        itemIndex !== index
                                )
                            )
                        }
                    >
                        Remove
                    </button>
                </div>
            ))}

            <div className={Styles.actions}>
                <button
                    type="button"
                    className={`${Styles.btn} ${Styles.btnGhost}`}
                    onClick={() =>
                        setItems((previous) => [
                            ...previous,
                            { title: "" },
                        ])
                    }
                >
                    + Add category
                </button>

                <button
                    className={Styles.btn}
                    type="submit"
                    disabled={saving}
                >
                    {saving
                        ? "Saving..."
                        : "Save categories"}
                </button>
            </div>
        </form>
    );
}

/* ==================================================
   EDITOR
================================================== */

function Editor({ type }) {
    const { loading, layout, reload } =
        useLayout(type);

    const Form = FORMS[type];

    if (loading) {
        return (
            <p className={Styles.muted}>
                Loading {type}...
            </p>
        );
    }

    return (
        <>
            {!layoutExists(layout) && (
                <p
                    className={Styles.muted}
                    style={{ marginBottom: 14 }}
                >
                    No saved {type} layout was found.
                    You can create one below.
                </p>
            )}

            <Form
                key={`${type}-${JSON.stringify(layout)}`}
                layout={layout}
                reload={reload}
            />
        </>
    );
}

/* ==================================================
   ADMIN LAYOUT PAGE
================================================== */

export default function AdminLayout() {
    const [tab, setTab] = useState("banner");

    return (
        <section className={Styles.panel}>
            <h1>Site Layout</h1>

            <div className={Styles.tabs}>
                {TABS.map((item) => (
                    <button
                        key={item}
                        type="button"
                        className={`${Styles.tab} ${
                            tab === item
                                ? Styles.tabActive
                                : ""
                        }`}
                        onClick={() => setTab(item)}
                    >
                        {item.charAt(0).toUpperCase() +
                            item.slice(1)}
                    </button>
                ))}
            </div>

            <Editor
                key={tab}
                type={tab}
            />
        </section>
    );
}






// import { useCallback, useEffect, useState } from "react";
// import axios from "axios";
// import toast from "react-hot-toast";

// import Styles from "./_admin.module.css";

// const API_BASE = "https://mockapi-mauve.vercel.app/api/v1";

// const layoutAPI = axios.create({
//     baseURL: `${API_BASE}/layout`,
//     headers: {
//         "Content-Type": "application/json",
//     },
// });

// /* ---------------- AUTH TOKEN ---------------- */

// layoutAPI.interceptors.request.use(
//     (config) => {
//         const token =
//             localStorage.getItem("token") ||
//             localStorage.getItem("TOKEN");

//         if (token) {
//             config.headers = config.headers || {};
//             config.headers.Authorization = `Bearer ${token}`;
//         }

//         return config;
//     },
//     (error) => Promise.reject(error)
// );

// /* ---------------- CONSTANTS ---------------- */

// const TABS = ["banner", "faq", "categories"];

// const FORMS = {
//     banner: BannerForm,
//     faq: FaqForm,
//     categories: CategoriesForm,
// };

// /* ---------------- HELPERS ---------------- */

// function getMessage(error) {
//     return (
//         error.response?.data?.message ||
//         error.response?.data?.error ||
//         error.message ||
//         "Something went wrong."
//     );
// }

// function getLayoutData(response) {
//     const data = response?.data;

//     // API response: { success: true, layout: {...} }
//     if (data?.layout) {
//         return data.layout;
//     }

//     if (data?.data?.layout) {
//         return data.data.layout;
//     }

//     return data?.data ?? data ?? null;
// }

// /* ---------------- API FUNCTIONS ---------------- */

// async function getLayout(type) {
//     const response = await layoutAPI.get("/get-layout", {
//         params: { type },
//     });

//     return getLayoutData(response);
// }

// async function createLayout(body) {
//     return layoutAPI.post("/create-layout", body);
// }

// async function updateLayout(body) {
//     return layoutAPI.put("/update-layout", body);
// }

// /* ---------------- LOAD LAYOUT ---------------- */

// function useLayout(type) {
//     const [state, setState] = useState({
//         loading: true,
//         layout: null,
//     });

//     const reload = useCallback(async () => {
//         setState((previous) => ({
//             ...previous,
//             loading: true,
//         }));

//         try {
//             const layout = await getLayout(type);

//             setState({
//                 loading: false,
//                 layout,
//             });
//         } catch (error) {
//             const status = error.response?.status;
//             const message =
//                 error.response?.data?.message || "";

//             // No saved layout yet is a valid state.
//             if (
//                 [400, 404].includes(status) &&
//                 message.toLowerCase().includes("does not exist")
//             ) {
//                 setState({
//                     loading: false,
//                     layout: null,
//                 });

//                 return;
//             }

//             console.error(
//                 `Failed to load ${type} layout:`,
//                 error.response?.data || error.message
//             );

//             setState({
//                 loading: false,
//                 layout: null,
//             });
//         }
//     }, [type]);

//     useEffect(() => {
//         reload();
//     }, [reload]);

//     return {
//         ...state,
//         reload,
//     };
// }

// /* ---------------- SAVE HELPERS ---------------- */

// function layoutExists(layout) {
//     return Boolean(
//         layout &&
//         typeof layout === "object" &&
//         Object.keys(layout).length > 0
//     );
// }

// async function saveLayout(body, exists) {
//     const primary = exists ? updateLayout : createLayout;
//     const secondary = exists ? createLayout : updateLayout;

//     try {
//         return await primary(body);
//     } catch (error) {
//         const status = error.response?.status;

//         // Try the alternative only for possible create/update conflicts.
//         if ([400, 404, 409].includes(status)) {
//             return secondary(body);
//         }

//         throw error;
//     }
// }

// function useSave(type, layout, reload) {
//     const [saving, setSaving] = useState(false);

//     const save = async (body) => {
//         try {
//             setSaving(true);

//             const token =
//                 localStorage.getItem("token") ||
//                 localStorage.getItem("TOKEN");

//             if (!token) {
//                 toast.error(
//                     "Please log in again before saving."
//                 );
//                 return;
//             }

//             await saveLayout(
//                 {
//                     type,
//                     ...body,
//                 },
//                 layoutExists(layout)
//             );

//             toast.success(`${type} saved successfully`);

//             await reload();
//         } catch (error) {
//             console.error(
//                 `Failed to save ${type}:`,
//                 error.response?.data || error.message
//             );

//             if (error.response?.status === 401) {
//                 toast.error(
//                     "Session expired or token is invalid. Please log in again."
//                 );
//             } else {
//                 toast.error(getMessage(error));
//             }
//         } finally {
//             setSaving(false);
//         }
//     };

//     return {
//         saving,
//         save,
//     };
// }

// /* ==================================================
//    BANNER FORM
// ================================================== */

// function BannerForm({ layout, reload }) {
//     const banner = layout?.banner ?? layout ?? {};

//     const [title, setTitle] = useState(
//         banner.title || ""
//     );

//     const [subTitle, setSubTitle] = useState(
//         banner.subTitle || ""
//     );

//     const [image, setImage] = useState(
//         typeof banner.image === "string"
//             ? banner.image
//             : banner.image?.url || ""
//     );

//     const { saving, save } = useSave(
//         "banner",
//         layout,
//         reload
//     );

//     const onFile = (event) => {
//         const file = event.target.files?.[0];

//         if (!file) return;

//         if (!file.type.startsWith("image/")) {
//             toast.error("Please choose an image file.");
//             event.target.value = "";
//             return;
//         }

//         if (file.size > 5 * 1024 * 1024) {
//             toast.error("Image must be smaller than 5 MB.");
//             event.target.value = "";
//             return;
//         }

//         const reader = new FileReader();

//         reader.onload = () => {
//             setImage(String(reader.result));
//         };

//         reader.onerror = () => {
//             toast.error("Unable to read the image.");
//         };

//         reader.readAsDataURL(file);
//     };

//     const submit = (event) => {
//         event.preventDefault();

//         if (!title.trim()) {
//             toast.error("Title is required.");
//             return;
//         }

//         if (!image) {
//             toast.error("Banner image is required.");
//             return;
//         }

//         save({
//             image,
//             title: title.trim(),
//             subTitle: subTitle.trim(),
//         });
//     };

//     return (
//         <form
//             className={Styles.form}
//             onSubmit={submit}
//         >
//             <div className={Styles.field}>
//                 <label htmlFor="banner-title">
//                     Title
//                 </label>

//                 <input
//                     id="banner-title"
//                     type="text"
//                     value={title}
//                     onChange={(event) =>
//                         setTitle(event.target.value)
//                     }
//                     required
//                 />
//             </div>

//             <div className={Styles.field}>
//                 <label htmlFor="banner-subtitle">
//                     Subtitle
//                 </label>

//                 <textarea
//                     id="banner-subtitle"
//                     value={subTitle}
//                     onChange={(event) =>
//                         setSubTitle(event.target.value)
//                     }
//                 />
//             </div>

//             <div className={Styles.field}>
//                 <label htmlFor="banner-image">
//                     Image
//                 </label>

//                 <input
//                     id="banner-image"
//                     type="file"
//                     accept="image/*"
//                     onChange={onFile}
//                 />

//                 {image && (
//                     <img
//                         className={Styles.preview}
//                         src={image}
//                         alt="Banner preview"
//                         style={{
//                             display: "block",
//                             maxWidth: "100%",
//                             maxHeight: "220px",
//                             marginTop: "12px",
//                             objectFit: "contain",
//                         }}
//                     />
//                 )}
//             </div>

//             <div className={Styles.actions}>
//                 <button
//                     className={Styles.btn}
//                     type="submit"
//                     disabled={saving}
//                 >
//                     {saving
//                         ? "Saving..."
//                         : "Save banner"}
//                 </button>
//             </div>
//         </form>
//     );
// }

// /* ==================================================
//    FAQ FORM
// ================================================== */

// function FaqForm({ layout, reload }) {
//     const [items, setItems] = useState(
//         () =>
//             (layout?.faq || []).map((item) => ({
//                 question: item.question || "",
//                 answer: item.answer || "",
//             }))
//     );

//     const { saving, save } = useSave(
//         "faq",
//         layout,
//         reload
//     );

//     const update = (index, patch) => {
//         setItems((previous) =>
//             previous.map((item, itemIndex) =>
//                 itemIndex === index
//                     ? { ...item, ...patch }
//                     : item
//             )
//         );
//     };

//     const submit = (event) => {
//         event.preventDefault();

//         const faq = items
//             .map((item) => ({
//                 question: item.question.trim(),
//                 answer: item.answer.trim(),
//             }))
//             .filter(
//                 (item) =>
//                     item.question && item.answer
//             );

//         if (!faq.length) {
//             toast.error(
//                 "Add at least one question and answer."
//             );
//             return;
//         }

//         save({ faq });
//     };

//     return (
//         <form
//             className={Styles.form}
//             onSubmit={submit}
//         >
//             {items.map((item, index) => (
//                 <div
//                     className={Styles.faqBox}
//                     key={index}
//                 >
//                     <div>
//                         <input
//                             type="text"
//                             placeholder="Question"
//                             value={item.question}
//                             onChange={(event) =>
//                                 update(index, {
//                                     question:
//                                         event.target.value,
//                                 })
//                             }
//                         />

//                         <textarea
//                             placeholder="Answer"
//                             value={item.answer}
//                             onChange={(event) =>
//                                 update(index, {
//                                     answer:
//                                         event.target.value,
//                                 })
//                             }
//                         />
//                     </div>

//                     <button
//                         type="button"
//                         className={`${Styles.btn} ${Styles.btnDanger}`}
//                         onClick={() =>
//                             setItems((previous) =>
//                                 previous.filter(
//                                     (_, itemIndex) =>
//                                         itemIndex !== index
//                                 )
//                             )
//                         }
//                     >
//                         Remove
//                     </button>
//                 </div>
//             ))}

//             <div className={Styles.actions}>
//                 <button
//                     type="button"
//                     className={`${Styles.btn} ${Styles.btnGhost}`}
//                     onClick={() =>
//                         setItems((previous) => [
//                             ...previous,
//                             {
//                                 question: "",
//                                 answer: "",
//                             },
//                         ])
//                     }
//                 >
//                     + Add question
//                 </button>

//                 <button
//                     className={Styles.btn}
//                     type="submit"
//                     disabled={saving}
//                 >
//                     {saving
//                         ? "Saving..."
//                         : "Save FAQ"}
//                 </button>
//             </div>
//         </form>
//     );
// }

// /* ==================================================
//    CATEGORIES FORM
// ================================================== */

// function CategoriesForm({ layout, reload }) {
//     const [items, setItems] = useState(
//         () =>
//             (layout?.categories || []).map((item) => ({
//                 title: item.title || "",
//             }))
//     );

//     const { saving, save } = useSave(
//         "categories",
//         layout,
//         reload
//     );

//     const submit = (event) => {
//         event.preventDefault();

//         const categories = items
//             .map((item) => ({
//                 title: item.title.trim(),
//             }))
//             .filter((item) => item.title);

//         if (!categories.length) {
//             toast.error(
//                 "Add at least one category."
//             );
//             return;
//         }

//         save({ categories });
//     };

//     return (
//         <form
//             className={Styles.form}
//             onSubmit={submit}
//         >
//             {items.map((item, index) => (
//                 <div
//                     className={Styles.itemRow}
//                     key={index}
//                 >
//                     <input
//                         type="text"
//                         placeholder="Category title"
//                         value={item.title}
//                         onChange={(event) =>
//                             setItems((previous) =>
//                                 previous.map(
//                                     (category, categoryIndex) =>
//                                         categoryIndex === index
//                                             ? {
//                                                   title: event.target.value,
//                                               }
//                                             : category
//                                 )
//                             )
//                         }
//                     />

//                     <button
//                         type="button"
//                         className={`${Styles.btn} ${Styles.btnDanger}`}
//                         onClick={() =>
//                             setItems((previous) =>
//                                 previous.filter(
//                                     (_, itemIndex) =>
//                                         itemIndex !== index
//                                 )
//                             )
//                         }
//                     >
//                         Remove
//                     </button>
//                 </div>
//             ))}

//             <div className={Styles.actions}>
//                 <button
//                     type="button"
//                     className={`${Styles.btn} ${Styles.btnGhost}`}
//                     onClick={() =>
//                         setItems((previous) => [
//                             ...previous,
//                             { title: "" },
//                         ])
//                     }
//                 >
//                     + Add category
//                 </button>

//                 <button
//                     className={Styles.btn}
//                     type="submit"
//                     disabled={saving}
//                 >
//                     {saving
//                         ? "Saving..."
//                         : "Save categories"}
//                 </button>
//             </div>
//         </form>
//     );
// }

// /* ==================================================
//    EDITOR
// ================================================== */

// function Editor({ type }) {
//     const { loading, layout, reload } =
//         useLayout(type);

//     const Form = FORMS[type];

//     if (loading) {
//         return (
//             <p className={Styles.muted}>
//                 Loading {type}...
//             </p>
//         );
//     }

//     return (
//         <>
//             {!layoutExists(layout) && (
//                 <p
//                     className={Styles.muted}
//                     style={{ marginBottom: 14 }}
//                 >
//                     No saved {type} layout was found.
//                     You can create one below.
//                 </p>
//             )}

//             <Form
//                 key={`${type}-${JSON.stringify(layout)}`}
//                 layout={layout}
//                 reload={reload}
//             />
//         </>
//     );
// }

// /* ==================================================
//    ADMIN LAYOUT PAGE
// ================================================== */

// export default function AdminLayout() {
//     const [tab, setTab] = useState("banner");

//     return (
//         <section className={Styles.panel}>
//             <h1>Site Layout</h1>

//             <div className={Styles.tabs}>
//                 {TABS.map((item) => (
//                     <button
//                         key={item}
//                         type="button"
//                         className={`${Styles.tab} ${
//                             tab === item
//                                 ? Styles.tabActive
//                                 : ""
//                         }`}
//                         onClick={() => setTab(item)}
//                     >
//                         {item.charAt(0).toUpperCase() +
//                             item.slice(1)}
//                     </button>
//                 ))}
//             </div>

//             <Editor
//                 key={tab}
//                 type={tab}
//             />
//         </section>
//     );
// }