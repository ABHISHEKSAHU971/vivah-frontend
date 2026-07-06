"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, ArrowRight, Save, CheckCircle, Store, Music, 
  Camera, Sparkles, Utensils, Flower, Calendar, Upload, X, Loader2, AlertCircle, Check 
} from "lucide-react";
import { api } from "@/lib/api";

import { Suspense } from "react";

// Predefined choices matching Django models
const CUISINE_CHOICES = [
  { value: "veg", label: "Pure Veg" },
  { value: "nonveg", label: "Non-Veg" },
  { value: "both", label: "Veg + Non-Veg" },
  { value: "jain", label: "Jain" },
  { value: "rajasthani", label: "Rajasthani" },
  { value: "south_indian", label: "South Indian" },
  { value: "continental", label: "Continental" },
  { value: "multi", label: "Multi-Cuisine" },
];

const TIER_CHOICES = [
  { value: "low", label: "Budget (Low)" },
  { value: "medium", label: "Standard (Medium)" },
  { value: "average", label: "Premium (Average)" },
  { value: "high", label: "Luxury (High)" },
];

const VENUE_TYPES = [
  { value: "wedding_garden", label: "Wedding Garden" },
  { value: "banquet_hall", label: "Banquet Hall" },
  { value: "resort", label: "Resort" },
  { value: "farmhouse", label: "Farmhouse" },
  { value: "hotel", label: "Hotel" },
  { value: "party_hall", label: "Party Hall" },
  { value: "outdoor", label: "Outdoor Venue" },
];

const SERVICE_POLICIES = [
  { value: "none", label: "Not Available" },
  { value: "inhouse", label: "In-House Only" },
  { value: "both", label: "In-House + Outside Allowed" },
];

const DECORATOR_STYLES = [
  { value: "royal", label: "Royal" },
  { value: "floral", label: "Floral" },
  { value: "minimal", label: "Minimal Luxury" },
  { value: "bollywood", label: "Bollywood" },
  { value: "traditional", label: "Traditional" },
  { value: "modern", label: "Modern Premium" },
  { value: "cultural", label: "Cultural" },
  { value: "outdoor", label: "Outdoor Garden" },
];

const PHOTOGRAPHY_TYPES = ["candid", "traditional", "cinematic", "drone", "pre-wedding"];
const MAKEUP_BRANDS = ["MAC", "Sephora", "Huda Beauty", "Kryolan", "NARS", "Fenty Beauty", "Bobbi Brown", "Estee Lauder"];
const PLANNER_SERVICES = ["full_planning", "partial_coordination", "day_of_coordination", "decor_design"];

interface MenuSelection {
  category: string;
  customName?: string;
  count?: number;
}

const COURSE_TYPES = [
  { value: "Starters", label: "Starters" },
  { value: "Live Counters", label: "Live Counters" },
  { value: "Soup", label: "Soup" },
  { value: "Salad/Papad/Achar", label: "Salad/Papad/Achar" },
  { value: "Special Veg", label: "Special Veg" },
  { value: "Seasonal Veg", label: "Seasonal Veg" },
  { value: "Dal", label: "Dal" },
  { value: "Rice", label: "Rice" },
  { value: "Breads", label: "Breads" },
  { value: "Desserts", label: "Desserts" },
  { value: "Welcome Drinks", label: "Welcome Drinks" },
  { value: "Special Additions", label: "Special Additions" },
  { value: "Other", label: "Other Option" },
];

function parseDescriptionToSelections(description: string): MenuSelection[] {
  if (!description) return [];
  const selections: MenuSelection[] = [];

  const startersCats = ["Starters", "Live Counters", "Soup"];
  const mainCourseCats = ["Salad/Papad/Achar", "Special Veg", "Seasonal Veg", "Dal", "Rice", "Breads", "Desserts"];
  const allPredefined = [...startersCats, ...mainCourseCats, "Welcome Drinks", "Special Additions"];

  const parts = description.split(/(Starters:|Main Course:|Special Additions:)/i);

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (!part) continue;

    const lowerPart = part.toLowerCase();
    if (lowerPart === "starters:" || lowerPart === "main course:" || lowerPart === "special additions:") {
      continue;
    } else {
      const itemsStr = part.replace(/\.+$/, "").trim();
      const items = itemsStr.split(/,\s*/);
      for (const item of items) {
        const cleaned = item.trim();
        if (!cleaned) continue;

        const match = cleaned.match(/^([^(]+)(?:\((\d+)\))?$/);
        if (match) {
          const name = match[1].trim();
          const count = match[2] ? parseInt(match[2], 10) : undefined;

          const matchedPredefined = allPredefined.find(p => p.toLowerCase() === name.toLowerCase());
          if (matchedPredefined) {
            selections.push({ category: matchedPredefined, count });
          } else {
            selections.push({ category: "Other", customName: name, count });
          }
        }
      }
    }
  }

  return selections;
}

function formatSelectionsToDescription(selections: MenuSelection[]): string {
  const startersGroup: string[] = [];
  const mainCourseGroup: string[] = [];
  const specialAdditionsGroup: string[] = [];

  const startersCats = ["Starters", "Live Counters", "Soup"];
  const mainCourseCats = ["Salad/Papad/Achar", "Special Veg", "Seasonal Veg", "Dal", "Rice", "Breads", "Desserts"];

  selections.forEach((sel) => {
    let displayName = sel.category === "Other" ? (sel.customName || "Other") : sel.category;
    let itemStr = displayName;
    if (sel.count && sel.count > 0) {
      itemStr += ` (${sel.count})`;
    }

    if (startersCats.includes(sel.category)) {
      startersGroup.push(itemStr);
    } else if (mainCourseCats.includes(sel.category)) {
      mainCourseGroup.push(itemStr);
    } else {
      specialAdditionsGroup.push(itemStr);
    }
  });

  const sections: string[] = [];
  if (startersGroup.length > 0) {
    sections.push(`Starters: ${startersGroup.join(", ")}`);
  }
  if (mainCourseGroup.length > 0) {
    sections.push(`Main Course: ${mainCourseGroup.join(", ")}`);
  }
  if (specialAdditionsGroup.length > 0) {
    sections.push(`Special Additions: ${specialAdditionsGroup.join(", ")}`);
  }

  return sections.join(". ") + (sections.length > 0 ? "." : "");
}

function AddListingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "venue";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Base fields
  const [baseForm, setBaseForm] = useState({
    name: "",
    description: "",
    city: "Bhopal",
    state: "Madhya Pradesh",
    address: "",
  });

  // Category specific fields
  const [detailForm, setDetailForm] = useState<any>({});
  const [catererTab, setCatererTab] = useState("packages"); // "profile", "menu", "packages"

  // Image Upload State
  const [images, setImages] = useState<{ file?: File; preview: string }[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [masterFoodItems, setMasterFoodItems] = useState<any[]>([]);
  const [newDishCourse, setNewDishCourse] = useState("starter");

  // Fetch master food items on mount
  useEffect(() => {
    api.get("/catering/master-food-items/")
      .then((res) => {
        setMasterFoodItems(res.data.results || res.data.data || res.data || []);
      })
      .catch((err) => console.error("Fetch master food items error:", err));
  }, []);

  // Initialize detailed form structure depending on type
  useEffect(() => {
    switch (type) {
      case "photographer":
        setDetailForm({
          photography_types: ["candid"],
          team_size: 2,
          base_package_price: "",
          delivery_days_limit: 30,
        });
        break;
      case "makeup":
        setDetailForm({
          bridal_package_price: "",
          party_makeup_price: "",
          is_on_location: true,
          brands_used: ["MAC"],
        });
        break;
      case "planner":
        setDetailForm({
          services_offered: ["full_planning"],
          budget_min: "",
          budget_max: "",
          city_coverage: ["Bhopal"],
        });
        break;
      case "venue":
        setDetailForm({
          venue_type: "wedding_garden",
          min_capacity: 50,
          max_capacity: 500,
          price_per_day: "",
          decoration_policy: "both",
          catering_policy: "both",
          dj_policy: "both",
          planner_policy: "both",
          has_parking: true,
          has_accommodation: false,
          is_ac: false,
          is_outdoor: true,
          pincode: "",
          num_ac_rooms: 0,
          num_non_ac_rooms: 0,
          num_halls: 0,
        });
        break;
      case "dj":
        setDetailForm({
          name: "",
          tier: "medium",
          price: "",
          hours: 6,
          description: "",
        });
        break;
      case "caterer":
        setDetailForm({
          name: "",
          cuisine_type: "multi",
          tier: "high",
          price_per_plate: 1200,
          min_plates: 100,
          description: "Premium wedding catering services.",
          branches: [],
          menu_items: [],
          packages: [
            {
              name: "Reception Dinner Platinum",
              cuisine_type: "multi",
              tier: "high",
              price_per_plate: 1200,
              min_plates: 100,
              description: "Starters: Live Counters (4), Soup (1). Main Course: Salad/Papad/Achar, Special Veg (1), Seasonal Veg (3), Dal (1), Rice (2), Breads (5), Desserts (4). Special Additions: Barat Welcome, Chinese (2), South Indian (2), Continental (2), Ice Cream (3), Kesari Milk/Coffee (1), Shakes (2), Mocktails (2).",
              material_option: "both",
              price_per_plate_without_material: 600
            }
          ]
        });
        break;
      case "decorator":
        setDetailForm({
          name: "",
          style: "floral",
          description: "",
          includes: ["Flower Mandap", "Welcome Gate Floral Arch"],
        });
        break;
      default:
        setDetailForm({});
    }
  }, [type]);

  const handleBaseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBaseForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleDetailChange = (name: string, value: any) => {
    setDetailForm((prev: any) => ({ ...prev, [name]: value }));
    if (formErrors[`details.${name}`]) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy[`details.${name}`];
        return copy;
      });
    }
  };

  // Multiple checkbox selectors
  const toggleArrayItem = (fieldName: string, item: string) => {
    const current = detailForm[fieldName] || [];
    const next = current.includes(item)
      ? current.filter((x: string) => x !== item)
      : [...current, item];
    handleDetailChange(fieldName, next);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const nextImages = [...images];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      nextImages.push({
        file,
        preview: URL.createObjectURL(file),
      });
    }
    setImages(nextImages);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep = (currentStep: number) => {
    const errors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!baseForm.name.trim()) errors.name = "Listing Name is required";
      if (!baseForm.description.trim()) errors.description = "Description is required";
      if (!baseForm.address.trim()) errors.address = "Complete Address is required";
      if (!baseForm.city.trim()) errors.city = "City is required";
      if (!baseForm.state.trim()) errors.state = "State is required";
    } else if (type === "caterer") {
      if (currentStep === 2) {
        if (!detailForm.cuisines || detailForm.cuisines.length === 0) {
          errors["details.cuisines"] = "Select at least one cuisine type";
        }
      } else if (currentStep === 4) {
        if (!detailForm.packages || detailForm.packages.length === 0) {
          errors["details.packages"] = "Create at least one pricing plan tier";
        } else {
          detailForm.packages.forEach((pkg: any, idx: number) => {
            if (!pkg.name?.trim()) errors[`details.packages.${idx}.name`] = "Plan name is required";
            const option = pkg.material_option || "with_material";
            if ((option === "with_material" || option === "both") && !pkg.price_per_plate) {
              errors[`details.packages.${idx}.price_per_plate`] = "Price per plate (With Material) is required";
            }
            if ((option === "without_material" || option === "both") && !pkg.price_per_plate_without_material) {
              errors[`details.packages.${idx}.price_per_plate_without_material`] = "Price per plate (Without Material) is required";
            }
          });
        }
      }
    } else if (currentStep === 2) {
      // Validate service fields based on type
      if (type === "photographer") {
        if (!detailForm.base_package_price) errors["details.base_package_price"] = "Price is required";
        if (detailForm.photography_types?.length === 0) errors["details.photography_types"] = "Select at least one photography type";
      } else if (type === "makeup") {
        if (!detailForm.bridal_package_price) errors["details.bridal_package_price"] = "Bridal price is required";
        if (!detailForm.party_makeup_price) errors["details.party_makeup_price"] = "Party makeup price is required";
      } else if (type === "planner") {
        if (!detailForm.budget_min) errors["details.budget_min"] = "Min budget is required";
        if (!detailForm.budget_max) errors["details.budget_max"] = "Max budget is required";
      } else if (type === "venue") {
        if (!detailForm.price_per_day) errors["details.price_per_day"] = "Daily rent is required";
        if (!detailForm.max_capacity) errors["details.max_capacity"] = "Max capacity is required";
      } else if (type === "dj") {
        if (!detailForm.name?.trim()) errors["details.name"] = "Package Name is required";
        if (!detailForm.price) errors["details.price"] = "Price is required";
      } else if (type === "decorator") {
        if (!detailForm.name?.trim()) errors["details.name"] = "Package Name is required";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((s) => s + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setStep((s) => s - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (status: "draft" | "pending_approval") => {
    const isCaterer = type === "caterer";
    const maxValStep = isCaterer ? 4 : 2;
    for (let s = 1; s <= maxValStep; s++) {
      if (!validateStep(s)) {
        setStep(s);
        return;
      }
    }
    setLoading(true);
    setErrorMsg("");

    // Prepare payload
    const payload: any = {
      ...baseForm,
      service_type: type,
      status,
      details: { ...detailForm }
    };

    // Convert decimal strings to numbers for serialization safety
    if (payload.details.base_package_price) payload.details.base_package_price = parseFloat(payload.details.base_package_price);
    if (payload.details.bridal_package_price) payload.details.bridal_package_price = parseFloat(payload.details.bridal_package_price);
    if (payload.details.party_makeup_price) payload.details.party_makeup_price = parseFloat(payload.details.party_makeup_price);
    if (payload.details.budget_min) payload.details.budget_min = parseFloat(payload.details.budget_min);
    if (payload.details.budget_max) payload.details.budget_max = parseFloat(payload.details.budget_max);
    if (payload.details.price_per_day) payload.details.price_per_day = parseFloat(payload.details.price_per_day);
    if (payload.details.price) payload.details.price = parseFloat(payload.details.price);

    if (payload.details.team_size) payload.details.team_size = parseInt(payload.details.team_size);
    if (payload.details.delivery_days_limit) payload.details.delivery_days_limit = parseInt(payload.details.delivery_days_limit);
    if (payload.details.min_capacity) payload.details.min_capacity = parseInt(payload.details.min_capacity);
    if (payload.details.max_capacity) payload.details.max_capacity = parseInt(payload.details.max_capacity);
    if (payload.details.hours) payload.details.hours = parseInt(payload.details.hours);
    if (payload.details.num_ac_rooms !== undefined) payload.details.num_ac_rooms = parseInt(payload.details.num_ac_rooms) || 0;
    if (payload.details.num_non_ac_rooms !== undefined) payload.details.num_non_ac_rooms = parseInt(payload.details.num_non_ac_rooms) || 0;
    if (payload.details.num_halls !== undefined) payload.details.num_halls = parseInt(payload.details.num_halls) || 0;

    // Convert package fields to decimals/numbers for caterer
    if (isCaterer && payload.details.packages) {
      payload.details.packages = payload.details.packages.map((pkg: any) => ({
        ...pkg,
        price_per_plate: pkg.price_per_plate ? parseFloat(pkg.price_per_plate) : 0,
        price_per_plate_without_material: pkg.price_per_plate_without_material ? parseFloat(pkg.price_per_plate_without_material) : null,
        material_option: pkg.material_option || "with_material",
        min_plates: parseInt(pkg.min_plates) || 50
      }));
    }

    try {
      const response = await api.post("/listings/", payload);
      if (response.status === 201 || response.data.success) {
        // Success
        router.push("/vendor/listings");
      } else {
        setErrorMsg("Failed to save. " + (response.data.message || "Please check your inputs."));
      }
    } catch (err: any) {
      console.error("Listing create error:", err);
      if (err.response?.data?.errors) {
        // Flatten nested errors from serializer
        const errors = err.response.data.errors;
        const flat: Record<string, string> = {};
        Object.keys(errors).forEach((k) => {
          if (k === "details" && typeof errors[k] === "object") {
            Object.keys(errors[k]).forEach((dk) => {
              flat[`details.${dk}`] = Array.isArray(errors[k][dk]) ? errors[k][dk].join(" ") : errors[k][dk];
            });
          } else {
            flat[k] = Array.isArray(errors[k]) ? errors[k].join(" ") : errors[k];
          }
        });
        setFormErrors(flat);
        setErrorMsg("Please fix the validation errors below.");
      } else {
        setErrorMsg(err.response?.data?.detail || err.response?.data?.message || err.response?.data?.error || "An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getServiceLabel = () => {
    switch (type) {
      case "venue": return "Wedding Venue";
      case "dj": return "DJ / Sound System";
      case "photographer": return "Photographer";
      case "makeup": return "Makeup Artist";
      case "caterer": return "Catering Package";
      case "decorator": return "Decoration Package";
      case "planner": return "Wedding Planner";
      default: return "Service Listing";
    }
  };

  const getServiceIcon = () => {
    const c = "text-gold shrink-0";
    switch (type) {
      case "venue": return <Store className={c} size={22} />;
      case "dj": return <Music className={c} size={22} />;
      case "photographer": return <Camera className={c} size={22} />;
      case "makeup": return <Sparkles className={c} size={22} />;
      case "caterer": return <Utensils className={c} size={22} />;
      case "decorator": return <Flower className={c} size={22} />;
      case "planner": return <Calendar className={c} size={22} />;
      default: return <Store className={c} size={22} />;
    }
  };

  return (
    <div className="space-y-6 font-body max-w-3xl mx-auto pb-12">
      {/* Header Panel */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/vendor/listings/add" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black hover:border-gray-400 transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/15 flex items-center justify-center">
              {getServiceIcon()}
            </div>
            <div>
              <h1 className="text-xl font-heading font-semibold text-gray-900">Add {getServiceLabel()}</h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Step {step} of {type === "caterer" ? 4 : 3}</p>
            </div>
          </div>
        </div>
        
        {/* Progress Bar (Visual wow element) */}
        <div className="hidden sm:flex items-center gap-1.5 bg-zinc-50 border border-gray-150 px-3.5 py-1.5 rounded-full">
          <div className={`w-2.5 h-2.5 rounded-full transition-all ${step >= 1 ? "bg-gold" : "bg-gray-250"}`} />
          <div className="w-6 h-0.5 bg-gray-200" />
          <div className={`w-2.5 h-2.5 rounded-full transition-all ${step >= 2 ? "bg-gold" : "bg-gray-250"}`} />
          <div className="w-6 h-0.5 bg-gray-200" />
          <div className={`w-2.5 h-2.5 rounded-full transition-all ${step >= 3 ? "bg-gold" : "bg-gray-250"}`} />
          {type === "caterer" && (
            <>
              <div className="w-6 h-0.5 bg-gray-200" />
              <div className={`w-2.5 h-2.5 rounded-full transition-all ${step >= 4 ? "bg-gold" : "bg-gray-250"}`} />
            </>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-4 text-xs font-semibold flex items-center gap-2 shadow-sm animate-pulse">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: GENERAL INFORMATION */}
      {step === 1 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900 font-heading">General Information</h2>
            <p className="text-xs text-gray-400 mt-0.5">Provide base identification and descriptive fields for your celebration service listing.</p>
          </div>

          <hr className="border-gray-100" />

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Listing Title / Business Display Name</label>
              <input
                type="text"
                name="name"
                value={baseForm.name}
                onChange={handleBaseChange}
                placeholder="e.g. Royal Gardens Palace, Starlight Cinematic Studio"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white ${
                  formErrors.name ? "border-red-400" : "border-gray-200 text-gray-900"
                }`}
              />
              {formErrors.name && <p className="text-[10px] text-red-500 font-semibold">{formErrors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Service Detailed Description</label>
              <textarea
                name="description"
                value={baseForm.description}
                onChange={handleBaseChange}
                rows={5}
                placeholder="Detail your offerings, crew/venue highlights, experience, package flexibility, catering details, terms, etc..."
                className={`w-full border rounded-xl px-4 py-2.5 text-sm transition-all resize-none focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white ${
                  formErrors.description ? "border-red-400" : "border-gray-200 text-gray-900"
                }`}
              />
              {formErrors.description && <p className="text-[10px] text-red-500 font-semibold">{formErrors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">City</label>
                <input
                  type="text"
                  name="city"
                  value={baseForm.city}
                  onChange={handleBaseChange}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white ${
                    formErrors.city ? "border-red-400" : "border-gray-200 text-gray-900"
                  }`}
                />
                {formErrors.city && <p className="text-[10px] text-red-500 font-semibold">{formErrors.city}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">State</label>
                <input
                  type="text"
                  name="state"
                  value={baseForm.state}
                  onChange={handleBaseChange}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white ${
                    formErrors.state ? "border-red-400" : "border-gray-200 text-gray-900"
                  }`}
                />
                {formErrors.state && <p className="text-[10px] text-red-500 font-semibold">{formErrors.state}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Complete Address</label>
              <input
                type="text"
                name="address"
                value={baseForm.address}
                onChange={handleBaseChange}
                placeholder="Street address, colony, landmark etc."
                className={`w-full border rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white ${
                  formErrors.address ? "border-red-400" : "border-gray-200 text-gray-900"
                }`}
              />
              {formErrors.address && <p className="text-[10px] text-red-500 font-semibold">{formErrors.address}</p>}
            </div>
            {type === "caterer" && (
              <div className="space-y-4 pt-3 border-t border-gray-100">
                <div>
                  <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-widest text-slate-400">Upload Brand Logo & Photos</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Attach photos showcasing your catering business logo, setup, and buffet presentation.</p>
                </div>
                <div className="border-2 border-dashed border-gray-200 hover:border-gold/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors relative bg-zinc-50/30">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="w-10 h-10 rounded-full bg-gold/10 text-gold flex items-center justify-center border border-gold/15">
                    <Upload size={18} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-900">Upload brand image / logo</p>
                    <p className="text-[9px] text-gray-400">Supports JPEG, PNG, and WebP (Max 5MB each)</p>
                  </div>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative h-24 border border-gray-150 rounded-xl overflow-hidden shadow-sm group">
                        <img
                          src={img.preview}
                          alt={`Preview ${idx + 1}`}
                          className="object-cover w-full h-full"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={handleNext}
              className="btn-gold rounded-xl text-xs font-bold px-6 py-3 flex items-center gap-1.5 transition-all shadow-md"
            >
              Configure Details <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: BUSINESS PROFILE & BRANCHES FOR CATERER */}
      {step === 2 && type === "caterer" && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900 font-heading">Business Profile & Branches</h2>
            <p className="text-xs text-gray-400 mt-0.5">Define your cuisines specialization, minimum order limits, and branch locations.</p>
          </div>

          <hr className="border-gray-100" />

          {/* Cuisines Checkboxes */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Cuisines Offered</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {["Rajasthani", "Gujarati", "South Indian", "Multi-Cuisine", "Punjabi", "Continental", "Jain", "Chinese"].map((cuisine) => {
                const cuisines = detailForm.cuisines || [];
                const selected = cuisines.includes(cuisine.toLowerCase());
                return (
                  <button
                    key={cuisine}
                    type="button"
                    onClick={() => {
                      const next = selected 
                        ? cuisines.filter((c: string) => c !== cuisine.toLowerCase())
                        : [...cuisines, cuisine.toLowerCase()];
                      handleDetailChange("cuisines", next);
                    }}
                    className={`px-3 py-2 rounded-xl border text-xs capitalize text-left transition-all flex items-center justify-between ${
                      selected 
                        ? "bg-gold/10 text-gold border-gold font-semibold" 
                        : "bg-white text-gray-600 border-gray-250 hover:border-gray-400"
                    }`}
                  >
                    <span>{cuisine}</span>
                    {selected && <Check size={12} />}
                  </button>
                );
              })}
            </div>
            {formErrors["details.cuisines"] && <p className="text-[10px] text-red-500 font-semibold">{formErrors["details.cuisines"]}</p>}
          </div>

          {/* Min Guest capacity */}
          <div className="space-y-1.5 max-w-xs">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Minimum Guest Capacity Limit</label>
            <input
              type="number"
              min={20}
              placeholder="e.g. 50"
              value={detailForm.min_guests || 50}
              onChange={(e) => handleDetailChange("min_guests", parseInt(e.target.value) || 50)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white text-gray-950"
            />
          </div>

          {/* Branches Manager */}
          <div className="space-y-4 pt-3 border-t border-gray-100">
            <div>
              <h3 className="text-xs font-semibold text-gray-900">Branch Locations</h3>
              <p className="text-[10px] text-gray-400">List operational branches to service leads across multiple areas.</p>
            </div>
            
            <div className="space-y-3">
              {detailForm.branches?.map((branch: any, idx: number) => (
                <div key={idx} className="flex gap-3 items-end p-4 border border-gray-150 rounded-xl bg-zinc-50/50">
                  <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase">Branch Name</label>
                      <input
                        type="text"
                        value={branch.name}
                        placeholder="e.g. Main Branch"
                        onChange={(e) => {
                          const list = [...detailForm.branches];
                          list[idx].name = e.target.value;
                          handleDetailChange("branches", list);
                        }}
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white text-gray-950"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase">Address</label>
                      <input
                        type="text"
                        value={branch.address}
                        placeholder="e.g. Maharana Pratap Nagar"
                        onChange={(e) => {
                          const list = [...detailForm.branches];
                          list[idx].address = e.target.value;
                          handleDetailChange("branches", list);
                        }}
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white text-gray-950"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase">Phone Number</label>
                      <input
                        type="text"
                        value={branch.phone}
                        placeholder="e.g. 9876543210"
                        onChange={(e) => {
                          const list = [...detailForm.branches];
                          list[idx].phone = e.target.value;
                          handleDetailChange("branches", list);
                        }}
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white text-gray-950"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const list = detailForm.branches.filter((_: any, i: number) => i !== idx);
                      handleDetailChange("branches", list);
                    }}
                    className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-xl border border-red-200 transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => {
                  const list = [...(detailForm.branches || []), { name: "", address: "", phone: "" }];
                  handleDetailChange("branches", list);
                }}
                className="w-full border border-dashed border-gray-300 py-3 rounded-xl hover:bg-slate-50 text-xs font-semibold text-gray-500 hover:text-black transition-all flex items-center justify-center gap-1"
              >
                + Add Operational Branch
              </button>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex justify-between items-center pt-3 border-t border-gray-50">
            <button
              onClick={handleBack}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-1"
            >
              <ArrowLeft size={13} /> Back
            </button>
            <button
              onClick={handleNext}
              className="btn-gold rounded-xl text-xs font-bold px-6 py-3 flex items-center gap-1.5 transition-all shadow-md"
            >
              Master Menu Library <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: CATEGORY SPECIFIC DETAILS FOR NON-CATERERS */}
      {step === 2 && type !== "caterer" && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900 font-heading">{getServiceLabel()} Specification Details</h2>
            <p className="text-xs text-gray-400 mt-0.5">Please provide specific characteristics, capacities, policies, and pricing tiers required by the server catalog.</p>
          </div>

          <hr className="border-gray-100" />

          {/* PHOTOGRAPHER DETAIL FORM */}
          {type === "photographer" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Photography Specialties Offered</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {PHOTOGRAPHY_TYPES.map((specialty) => {
                    const selected = detailForm.photography_types?.includes(specialty);
                    return (
                      <button
                        key={specialty}
                        type="button"
                        onClick={() => toggleArrayItem("photography_types", specialty)}
                        className={`px-3 py-1.5 rounded-xl border text-xs capitalize transition-all ${
                          selected 
                            ? "bg-gold/10 text-gold border-gold font-semibold" 
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {specialty} Photo/Film
                      </button>
                    );
                  })}
                </div>
                {formErrors["details.photography_types"] && <p className="text-[10px] text-red-500 font-semibold">{formErrors["details.photography_types"]}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Crew size (no. of cameras)</label>
                  <input
                    type="number"
                    min={1}
                    value={detailForm.team_size}
                    onChange={(e) => handleDetailChange("team_size", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white text-gray-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Base Package Cost (per day) (₹)</label>
                  <input
                    type="number"
                    value={detailForm.base_package_price}
                    placeholder="e.g. 50000"
                    onChange={(e) => handleDetailChange("base_package_price", e.target.value)}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white ${
                      formErrors["details.base_package_price"] ? "border-red-400" : "border-gray-200 text-gray-900"
                    }`}
                  />
                  {formErrors["details.base_package_price"] && <p className="text-[10px] text-red-500 font-semibold">{formErrors["details.base_package_price"]}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Delivery Lead Time (Days)</label>
                  <input
                    type="number"
                    min={1}
                    value={detailForm.delivery_days_limit}
                    onChange={(e) => handleDetailChange("delivery_days_limit", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white text-gray-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* MAKEUP DETAIL FORM */}
          {type === "makeup" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Bridal Makeup Package (₹)</label>
                  <input
                    type="number"
                    value={detailForm.bridal_package_price}
                    placeholder="e.g. 15000"
                    onChange={(e) => handleDetailChange("bridal_package_price", e.target.value)}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white ${
                      formErrors["details.bridal_package_price"] ? "border-red-400" : "border-gray-200 text-gray-900"
                    }`}
                  />
                  {formErrors["details.bridal_package_price"] && <p className="text-[10px] text-red-500 font-semibold">{formErrors["details.bridal_package_price"]}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Guest/Party Makeup Price (per pax) (₹)</label>
                  <input
                    type="number"
                    value={detailForm.party_makeup_price}
                    placeholder="e.g. 3000"
                    onChange={(e) => handleDetailChange("party_makeup_price", e.target.value)}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white ${
                      formErrors["details.party_makeup_price"] ? "border-red-400" : "border-gray-200 text-gray-900"
                    }`}
                  />
                  {formErrors["details.party_makeup_price"] && <p className="text-[10px] text-red-500 font-semibold">{formErrors["details.party_makeup_price"]}</p>}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Travel / On-Location Service</label>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_on_location"
                    checked={detailForm.is_on_location || false}
                    onChange={(e) => handleDetailChange("is_on_location", e.target.checked)}
                    className="w-4.5 h-4.5 rounded accent-gold"
                  />
                  <label htmlFor="is_on_location" className="text-xs text-gray-600 font-semibold cursor-pointer">
                    Available to travel to client venue (for bridal / destination event)
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Cosmetic Brands Used</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {MAKEUP_BRANDS.map((brand) => {
                    const selected = detailForm.brands_used?.includes(brand);
                    return (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => toggleArrayItem("brands_used", brand)}
                        className={`px-3 py-1.5 rounded-xl border text-xs capitalize transition-all ${
                          selected 
                            ? "bg-gold/10 text-gold border-gold font-semibold" 
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {brand}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* PLANNER DETAIL FORM */}
          {type === "planner" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Planning & Coordination Tiers</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {PLANNER_SERVICES.map((srv) => {
                    const selected = detailForm.services_offered?.includes(srv);
                    return (
                      <button
                        key={srv}
                        type="button"
                        onClick={() => toggleArrayItem("services_offered", srv)}
                        className={`px-3 py-1.5 rounded-xl border text-xs capitalize transition-all ${
                          selected 
                            ? "bg-gold/10 text-gold border-gold font-semibold" 
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {srv.replace(/_/g, " ")}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Minimum Managed Wedding Budget (₹)</label>
                  <input
                    type="number"
                    value={detailForm.budget_min}
                    placeholder="e.g. 500000"
                    onChange={(e) => handleDetailChange("budget_min", e.target.value)}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white ${
                      formErrors["details.budget_min"] ? "border-red-400" : "border-gray-200 text-gray-900"
                    }`}
                  />
                  {formErrors["details.budget_min"] && <p className="text-[10px] text-red-500 font-semibold">{formErrors["details.budget_min"]}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Maximum Managed Wedding Budget (₹)</label>
                  <input
                    type="number"
                    value={detailForm.budget_max}
                    placeholder="e.g. 2000000"
                    onChange={(e) => handleDetailChange("budget_max", e.target.value)}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white ${
                      formErrors["details.budget_max"] ? "border-red-400" : "border-gray-200 text-gray-900"
                    }`}
                  />
                  {formErrors["details.budget_max"] && <p className="text-[10px] text-red-500 font-semibold">{formErrors["details.budget_max"]}</p>}
                </div>
              </div>

              {/* Tag style dynamic city coverage */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">City Operations Coverage</label>
                <div className="flex flex-wrap gap-2 items-center p-2.5 border border-gray-200 rounded-xl bg-zinc-50/30">
                  {detailForm.city_coverage?.map((city: string, idx: number) => (
                    <span key={city} className="bg-gold/10 text-gold border border-gold/15 text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 capitalize">
                      {city}
                      <button 
                        type="button" 
                        onClick={() => handleDetailChange("city_coverage", detailForm.city_coverage.filter((_: any, i: number) => i !== idx))}
                        className="text-gray-400 hover:text-black hover:bg-gold/10 rounded-full"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Add city & press Enter"
                    className="border-none bg-transparent focus:outline-none text-xs flex-grow p-1 text-gray-900 placeholder-slate-400 min-w-[120px]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = e.currentTarget.value.trim();
                        if (val && !detailForm.city_coverage?.includes(val)) {
                          handleDetailChange("city_coverage", [...(detailForm.city_coverage || []), val]);
                          e.currentTarget.value = "";
                        }
                      }
                    }}
                  />
                </div>
                <p className="text-[9px] text-gray-400 mt-1">Type a serviced city (e.g. Indore, Bhopal) and press Enter to save tags</p>
              </div>
            </div>
          )}

          {/* VENUE DETAIL FORM */}
          {type === "venue" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Venue Category / Type</label>
                  <select
                    value={detailForm.venue_type}
                    onChange={(e) => handleDetailChange("venue_type", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white text-gray-900"
                  >
                    {VENUE_TYPES.map((v) => (
                      <option key={v.value} value={v.value}>{v.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Base Rental Fee / Day (₹)</label>
                  <input
                    type="number"
                    value={detailForm.price_per_day}
                    placeholder="e.g. 100000"
                    onChange={(e) => handleDetailChange("price_per_day", e.target.value)}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white ${
                      formErrors["details.price_per_day"] ? "border-red-400" : "border-gray-200 text-gray-900"
                    }`}
                  />
                  {formErrors["details.price_per_day"] && <p className="text-[10px] text-red-500 font-semibold">{formErrors["details.price_per_day"]}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Pin Code</label>
                  <input
                    type="text"
                    value={detailForm.pincode}
                    placeholder="e.g. 462011"
                    onChange={(e) => handleDetailChange("pincode", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Minimum Guest Capacity</label>
                  <input
                    type="number"
                    min={10}
                    value={detailForm.min_capacity}
                    onChange={(e) => handleDetailChange("min_capacity", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white text-gray-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Maximum Guest Capacity</label>
                  <input
                    type="number"
                    min={10}
                    value={detailForm.max_capacity}
                    onChange={(e) => handleDetailChange("max_capacity", e.target.value)}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white ${
                      formErrors["details.max_capacity"] ? "border-red-400" : "border-gray-200 text-gray-900"
                    }`}
                  />
                  {formErrors["details.max_capacity"] && <p className="text-[10px] text-red-500 font-semibold">{formErrors["details.max_capacity"]}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Number of AC Rooms</label>
                  <input
                    type="number"
                    min={0}
                    value={detailForm.num_ac_rooms ?? 0}
                    onChange={(e) => handleDetailChange("num_ac_rooms", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white text-gray-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Number of Non-AC Rooms</label>
                  <input
                    type="number"
                    min={0}
                    value={detailForm.num_non_ac_rooms ?? 0}
                    onChange={(e) => handleDetailChange("num_non_ac_rooms", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white text-gray-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Number of Halls</label>
                  <input
                    type="number"
                    min={0}
                    value={detailForm.num_halls ?? 0}
                    onChange={(e) => handleDetailChange("num_halls", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white text-gray-900"
                  />
                </div>
              </div>

              <hr className="border-gray-50" />

              {/* Policy Fields - critical business requirement */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-900">In-house Exclusive Policies</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Decoration Policy</label>
                    <select
                      value={detailForm.decoration_policy}
                      onChange={(e) => handleDetailChange("decoration_policy", e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white text-gray-900"
                    >
                      {SERVICE_POLICIES.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Catering Policy</label>
                    <select
                      value={detailForm.catering_policy}
                      onChange={(e) => handleDetailChange("catering_policy", e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white text-gray-900"
                    >
                      {SERVICE_POLICIES.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">DJ & Music Policy</label>
                    <select
                      value={detailForm.dj_policy}
                      onChange={(e) => handleDetailChange("dj_policy", e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white text-gray-900"
                    >
                      {SERVICE_POLICIES.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Planner Policy</label>
                    <select
                      value={detailForm.planner_policy}
                      onChange={(e) => handleDetailChange("planner_policy", e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white text-gray-900"
                    >
                      {SERVICE_POLICIES.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Amenities checkboxes */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Features & Amenities</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { key: "has_parking", label: "Parking Space" },
                    { key: "has_accommodation", label: "Guest Rooms" },
                    { key: "is_ac", label: "A/C Hall" },
                    { key: "is_outdoor", label: "Open Lawn / Garden" },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-2 border border-gray-150 p-3 rounded-xl hover:bg-slate-50 cursor-pointer select-none transition-colors">
                      <input
                        type="checkbox"
                        checked={detailForm[item.key] || false}
                        onChange={(e) => handleDetailChange(item.key, e.target.checked)}
                        className="rounded accent-gold shrink-0"
                      />
                      <span className="text-xs text-gray-700 font-semibold">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* DJ / ENTERTAINMENT DETAIL FORM */}
          {type === "dj" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Package Title</label>
                <input
                  type="text"
                  placeholder="e.g. Standard Sound System & Lights, Grand Wedding DJ Package"
                  value={detailForm.name}
                  onChange={(e) => handleDetailChange("name", e.target.value)}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white ${
                    formErrors["details.name"] ? "border-red-400" : "border-gray-200 text-gray-900"
                  }`}
                />
                {formErrors["details.name"] && <p className="text-[10px] text-red-500 font-semibold">{formErrors["details.name"]}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Service Tier</label>
                  <select
                    value={detailForm.tier || "medium"}
                    onChange={(e) => handleDetailChange("tier", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white text-gray-900"
                  >
                    {TIER_CHOICES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Package Price (per event) (₹)</label>
                  <input
                    type="number"
                    value={detailForm.price}
                    placeholder="e.g. 25000"
                    onChange={(e) => handleDetailChange("price", e.target.value)}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white ${
                      formErrors["details.price"] ? "border-red-400" : "border-gray-200 text-gray-900"
                    }`}
                  />
                  {formErrors["details.price"] && <p className="text-[10px] text-red-500 font-semibold">{formErrors["details.price"]}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Standard Hours Covered</label>
                  <input
                    type="number"
                    min={1}
                    value={detailForm.hours}
                    onChange={(e) => handleDetailChange("hours", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white text-gray-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">What is included in this Sound setup?</label>
                <textarea
                  value={detailForm.description}
                  rows={4}
                  placeholder="Provide sound setup details e.g. 2 dual JBL tops, 2 single bass, LED wash lights, smoke machine, wireless mics etc."
                  onChange={(e) => handleDetailChange("description", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white text-gray-900 resize-none"
                />
              </div>
            </div>
          )}



          {/* DECORATION DETAIL FORM */}
          {type === "decorator" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Decoration Theme Name</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Marigold Stage Setup, Glasshouse Minimalistic Decor"
                  value={detailForm.name}
                  onChange={(e) => handleDetailChange("name", e.target.value)}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white ${
                    formErrors["details.name"] ? "border-red-400" : "border-gray-200 text-gray-900"
                  }`}
                />
                {formErrors["details.name"] && <p className="text-[10px] text-red-500 font-semibold">{formErrors["details.name"]}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Decor Style Style Theme</label>
                <select
                  value={detailForm.style}
                  onChange={(e) => handleDetailChange("style", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white text-gray-900"
                >
                  {DECORATOR_STYLES.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Theme Description</label>
                <textarea
                  value={detailForm.description}
                  rows={4}
                  placeholder="Provide background, color themes, drapery, lighting specs, or materials used."
                  onChange={(e) => handleDetailChange("description", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white text-gray-900 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Inclusions (What is included in this package?)</label>
                <div className="flex flex-wrap gap-2 items-center p-2.5 border border-gray-200 rounded-xl bg-zinc-50/30">
                  {detailForm.includes?.map((inc: string, idx: number) => (
                    <span key={inc} className="bg-gold/10 text-gold border border-gold/15 text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
                      {inc}
                      <button 
                        type="button" 
                        onClick={() => handleDetailChange("includes", detailForm.includes.filter((_: any, i: number) => i !== idx))}
                        className="text-gray-400 hover:text-black hover:bg-gold/10 rounded-full"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Add item & press Enter"
                    className="border-none bg-transparent focus:outline-none text-xs flex-grow p-1 text-gray-900 placeholder-slate-400 min-w-[150px]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = e.currentTarget.value.trim();
                        if (val && !detailForm.includes?.includes(val)) {
                          handleDetailChange("includes", [...(detailForm.includes || []), val]);
                          e.currentTarget.value = "";
                        }
                      }
                    }}
                  />
                </div>
                <p className="text-[9px] text-gray-400 mt-1">Type an item (e.g. LED stage wall, Marigold drapery, Truss setup) and press Enter to save</p>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex justify-between items-center pt-3 border-t border-gray-50">
            <button
              onClick={handleBack}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-1"
            >
              <ArrowLeft size={13} /> Back
            </button>
            <button
              onClick={handleNext}
              className="btn-gold rounded-xl text-xs font-bold px-6 py-3 flex items-center gap-1.5 transition-all shadow-md"
            >
              Configure Media <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: MEDIA UPLOAD & SUBMIT FOR NON-CATERERS */}
      {step === 3 && type !== "caterer" && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900 font-heading">Media Showcase Upload</h2>
            <p className="text-xs text-gray-400 mt-0.5">Attach high-resolution photos showcasing your venue setup, wedding portfolio, makeup work, or sound stages.</p>
          </div>

          <hr className="border-gray-100" />

          {/* Image Upload Area */}
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-200 hover:border-gold/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors relative group bg-zinc-50/30">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center border border-gold/15 group-hover:bg-gold group-hover:text-black transition-all">
                <Upload size={20} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-900">Drag and drop images here</p>
                <p className="text-xs text-gray-400 mt-0.5">Supports JPEG, PNG, and WebP (Max 5MB each)</p>
              </div>
            </div>

            {/* Previews Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative h-28 border border-gray-150 rounded-xl overflow-hidden shadow-sm group">
                    <img
                      src={img.preview}
                      alt={`Preview ${idx + 1}`}
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-amber-50/60 border border-amber-500/10 rounded-xl p-3 text-[11px] text-amber-800 flex items-start gap-2">
              <CheckCircle size={14} className="shrink-0 text-gold mt-0.5" />
              <p>Image files will be linked with your listing profile. You can finalize your changes and save this listing immediately.</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 pt-3 border-t border-gray-100">
            <button
              onClick={handleBack}
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex items-center justify-center gap-1"
            >
              <ArrowLeft size={13} /> Back
            </button>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleSubmit("draft")}
                disabled={loading}
                className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-950 text-white flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                {loading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => handleSubmit("pending_approval")}
                disabled={loading}
                className="w-full sm:w-auto btn-gold rounded-xl text-xs font-bold px-6 py-3 flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                {loading ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                Publish for Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: MASTER MENU LIBRARY FOR CATERER */}
      {step === 3 && type === "caterer" && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900 font-heading">Master Menu Library</h2>
            <p className="text-xs text-gray-400 mt-0.5">Add dishes cataloged in your catering plans so customers can browse or select them.</p>
          </div>

          <hr className="border-gray-100" />

          {/* Add dish inline form */}
          <div className="p-4 border border-gold/20 rounded-2xl bg-gold/5 space-y-3">
            <h4 className="text-[10px] font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-gold text-black flex items-center justify-center text-[8px] font-black">+</span>
              Add Dish to Library
            </h4>
            
            {/* Global Catalog Selector */}
            {masterFoodItems.length > 0 && (
              <div className="space-y-1 pb-1">
                <label className="text-[9px] font-bold text-gold uppercase block">Select from Shared Database Catalog (Optional)</label>
                <select
                  id="select-master-food"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    const matched = masterFoodItems.find((x) => String(x.id) === val);
                    if (matched) {
                      const nameEl = document.getElementById("new-dish-name") as HTMLInputElement;
                      const vegBtn = document.getElementById("nd-veg") as HTMLButtonElement;
                      const jainBtn = document.getElementById("nd-jain") as HTMLButtonElement;
                      const spicyBtn = document.getElementById("nd-spicy") as HTMLButtonElement;

                      if (nameEl) nameEl.value = matched.name;

                      // Update buttons active status
                      if (vegBtn) {
                        vegBtn.dataset.active = matched.is_veg ? "true" : "false";
                        vegBtn.className = matched.is_veg
                          ? "px-1.5 py-1 rounded border text-[9px] font-bold border-gold/60 bg-gold/10 text-gold transition-all"
                          : "px-1.5 py-1 rounded border text-[9px] font-bold border-gray-200 bg-white text-gray-400 transition-all";
                      }
                      if (jainBtn) {
                        jainBtn.dataset.active = matched.is_jain ? "true" : "false";
                        jainBtn.className = matched.is_jain
                          ? "px-1.5 py-1 rounded border text-[9px] font-bold border-gold/60 bg-gold/10 text-gold transition-all"
                          : "px-1.5 py-1 rounded border text-[9px] font-bold border-gray-200 bg-white text-gray-400 transition-all";
                      }
                      if (spicyBtn) {
                        spicyBtn.dataset.active = matched.is_spicy ? "true" : "false";
                        spicyBtn.className = matched.is_spicy
                          ? "px-1.5 py-1 rounded border text-[9px] font-bold border-gold/60 bg-gold/10 text-gold transition-all"
                          : "px-1.5 py-1 rounded border text-[9px] font-bold border-gray-200 bg-white text-gray-400 transition-all";
                      }
                    }
                  }}
                  className="w-full border border-gold/30 rounded-lg px-3 py-1.5 text-xs bg-white text-gray-900 focus:outline-none focus:border-gold"
                >
                  <option value="">-- Choose a standard dish --</option>
                  {masterFoodItems
                    .filter((item) => item.course === newDishCourse)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase">Dish Name *</label>
                <input
                  type="text"
                  id="new-dish-name"
                  placeholder="e.g. Paneer Pasanda, Dal Makhni"
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white text-gray-900 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase">Course</label>
                <select
                  id="new-dish-course"
                  value={newDishCourse}
                  onChange={(e) => {
                    setNewDishCourse(e.target.value);
                    const nameEl = document.getElementById("new-dish-name") as HTMLInputElement;
                    if (nameEl) nameEl.value = ""; // Clear input on course change
                    const selectCatalog = document.getElementById("select-master-food") as HTMLSelectElement;
                    if (selectCatalog) selectCatalog.value = ""; // Reset catalog select
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white text-gray-900 focus:outline-none focus:border-gold"
                >
                  <option value="starter">Starter</option>
                  <option value="live">Live Counter</option>
                  <option value="soup">Soup</option>
                  <option value="special_veg">Special Veg</option>
                  <option value="seasonal_veg">Seasonal Veg</option>
                  <option value="dal">Dal</option>
                  <option value="rice">Rice</option>
                  <option value="breads">Breads Basket</option>
                  <option value="dessert">Dessert</option>
                  <option value="welcome">Welcome Drink</option>
                  <option value="special_additions">Special Additions</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase">Short Description</label>
                <input
                  type="text"
                  id="new-dish-desc"
                  placeholder="Ingredients, style notes..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white text-gray-900 focus:outline-none focus:border-gold"
                />
              </div>
              <div className="flex gap-2 justify-between items-end">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Dietary</label>
                  <div id="new-dish-dietary" className="flex gap-1.5">
                    {[
                      { id: "nd-veg",   label: "Veg",  field: "is_veg",   emoji: "🌿" },
                      { id: "nd-jain",  label: "Jain", field: "is_jain",  emoji: "🙏" },
                      { id: "nd-spicy", label: "Hot",  field: "is_spicy", emoji: "🌶️" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        id={opt.id}
                        data-active="false"
                        onClick={(e) => {
                          const btn = e.currentTarget;
                          const isActive = btn.dataset.active === "true";
                          btn.dataset.active = isActive ? "false" : "true";
                          btn.className = isActive
                            ? "px-1.5 py-1 rounded border text-[9px] font-bold border-gray-200 bg-white text-gray-400 transition-all"
                            : "px-1.5 py-1 rounded border text-[9px] font-bold border-gold/60 bg-gold/10 text-gold transition-all";
                        }}
                        className="px-1.5 py-1 rounded border text-[9px] font-bold border-gray-200 bg-white text-gray-400 transition-all"
                        title={opt.label}
                      >
                        {opt.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <button
              type="button"
              onClick={async () => {
                const nameEl = document.getElementById("new-dish-name") as HTMLInputElement;
                const courseEl = document.getElementById("new-dish-course") as HTMLSelectElement;
                const descEl = document.getElementById("new-dish-desc") as HTMLInputElement;
                const vegBtn = document.getElementById("nd-veg") as HTMLButtonElement;
                const jainBtn = document.getElementById("nd-jain") as HTMLButtonElement;
                const spicyBtn = document.getElementById("nd-spicy") as HTMLButtonElement;
                
                const name = nameEl?.value.trim();
                if (!name) return;

                const course = courseEl?.value || "main";
                const is_veg = vegBtn?.dataset.active === "true";
                const is_jain = jainBtn?.dataset.active === "true";
                const is_spicy = spicyBtn?.dataset.active === "true";
                const description = descEl?.value.trim() || "";

                // 1. Check if it already exists in the standard catalog
                let masterFoodItem = masterFoodItems.find(
                  (x) => x.name.toLowerCase() === name.toLowerCase() && x.course === course
                );

                // 2. If it does not exist, save it globally on the backend
                if (!masterFoodItem) {
                  try {
                    const res = await api.post("/catering/master-food-items/", {
                      name,
                      course,
                      is_veg,
                      is_jain,
                      is_spicy,
                      description
                    });
                    masterFoodItem = res.data;
                    setMasterFoodItems((prev) => [...prev, masterFoodItem]);
                  } catch (err) {
                    console.error("Error creating custom master food item:", err);
                  }
                }

                // 3. Add to the local caterer package selection
                const list = [...(detailForm.menu_items || []), {
                  name,
                  course,
                  is_veg,
                  is_jain,
                  is_spicy,
                  description,
                  master_food_item: masterFoodItem ? masterFoodItem.id : null
                }];
                
                handleDetailChange("menu_items", list);
                nameEl.value = "";
                if (descEl) descEl.value = "";
                
                // Reset select dropdown
                const selectCatalog = document.getElementById("select-master-food") as HTMLSelectElement;
                if (selectCatalog) selectCatalog.value = "";

                // Reset dietary toggles
                [vegBtn, jainBtn, spicyBtn].forEach((btn) => {
                  if (btn) {
                    btn.dataset.active = "false";
                    btn.className = "px-1.5 py-1 rounded border text-[9px] font-bold border-gray-200 bg-white text-gray-400 transition-all";
                  }
                });
              }}
              className="w-full btn-gold rounded-lg py-2 text-xs font-semibold flex items-center justify-center gap-1 shadow-sm"
            >
              + Add Dish
            </button>
          </div>

          {/* Dishes list table */}
          <div className="border border-gray-150 rounded-xl overflow-hidden shadow-sm bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-gray-150 text-gray-500 font-semibold">
                  <th className="p-3">Dish Name</th>
                  <th className="p-3">Course</th>
                  <th className="p-3 text-center">Dietary Options</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {(!detailForm.menu_items || detailForm.menu_items.length === 0) ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-gray-400 italic">No dishes added to your library yet. Add some starters or mains above!</td>
                  </tr>
                ) : (
                  detailForm.menu_items.map((m: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-semibold text-gray-900">{m.name}</td>
                      <td className="p-3 capitalize text-gray-500">{m.course}</td>
                      <td className="p-3">
                        <div className="flex gap-2 justify-center">
                          {["is_veg", "is_jain", "is_spicy"].map((opt) => (
                            <label key={opt} className="flex items-center gap-1 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={m[opt] || false}
                                onChange={(e) => {
                                  const list = [...detailForm.menu_items];
                                  list[idx][opt] = e.target.checked;
                                  handleDetailChange("menu_items", list);
                                }}
                                className="w-3.5 h-3.5 accent-gold"
                              />
                              <span className="text-[10px] text-gray-500 capitalize">{opt.replace("is_", "")}</span>
                            </label>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            const list = detailForm.menu_items.filter((_: any, i: number) => i !== idx);
                            handleDetailChange("menu_items", list);
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-red-100 transition-all font-semibold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Controls */}
          <div className="flex justify-between items-center pt-3 border-t border-gray-50">
            <button
              onClick={handleBack}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-1"
            >
              <ArrowLeft size={13} /> Back
            </button>
            <button
              onClick={handleNext}
              className="btn-gold rounded-xl text-xs font-bold px-6 py-3 flex items-center gap-1.5 transition-all shadow-md"
            >
              Package Tiers <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: PACKAGE TIERS FOR CATERER */}
      {step === 4 && type === "caterer" && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900 font-heading">Package Tiers (Plans)</h2>
            <p className="text-xs text-gray-400 mt-0.5">Build pricing packages (e.g. Silver, Gold, Platinum) with plate pricing, minimum plates limits, and choose included items.</p>
          </div>

          <hr className="border-gray-100" />

          {/* Packages List */}
          <div className="space-y-4">
            {detailForm.packages?.map((pkg: any, idx: number) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-2xl bg-zinc-50/30 space-y-4 relative animate-fade-in">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gold">Plan Option #{idx + 1}</h3>
                  <button
                    type="button"
                    onClick={() => {
                      const list = detailForm.packages.filter((_: any, i: number) => i !== idx);
                      handleDetailChange("packages", list);
                    }}
                    className="bg-red-50 text-red-500 p-1.5 rounded-lg border border-red-100 hover:bg-red-100 transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Package Name</label>
                    <input
                      type="text"
                      value={pkg.name}
                      placeholder="e.g. Silver Plan, Premium Gold Banquet"
                      onChange={(e) => {
                        const list = [...detailForm.packages];
                        list[idx].name = e.target.value;
                        handleDetailChange("packages", list);
                      }}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:border-gold"
                    />
                    {formErrors[`details.packages.${idx}.name`] && <p className="text-[10px] text-red-500 font-semibold">{formErrors[`details.packages.${idx}.name`]}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Cuisine type</label>
                      <select
                        value={pkg.cuisine_type || "multi"}
                        onChange={(e) => {
                          const list = [...detailForm.packages];
                          list[idx].cuisine_type = e.target.value;
                          handleDetailChange("packages", list);
                        }}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:border-gold"
                      >
                        {CUISINE_CHOICES.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Service tier</label>
                      <select
                        value={pkg.tier || "medium"}
                        onChange={(e) => {
                          const list = [...detailForm.packages];
                          list[idx].tier = e.target.value;
                          handleDetailChange("packages", list);
                        }}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:border-gold"
                      >
                        {TIER_CHOICES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Material Option</label>
                    <select
                      value={pkg.material_option || "with_material"}
                      onChange={(e) => {
                        const list = [...detailForm.packages];
                        list[idx].material_option = e.target.value;
                        if (e.target.value === "with_material") {
                          list[idx].price_per_plate_without_material = "";
                        } else if (e.target.value === "without_material") {
                          list[idx].price_per_plate = "";
                        }
                        handleDetailChange("packages", list);
                      }}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:border-gold"
                    >
                      <option value="with_material">With Material Only</option>
                      <option value="without_material">Without Material Only</option>
                      <option value="both">Both (With & Without Material)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Min Plates Limit</label>
                    <input
                      type="number"
                      value={pkg.min_plates}
                      placeholder="e.g. 80"
                      onChange={(e) => {
                        const list = [...detailForm.packages];
                        list[idx].min_plates = parseInt(e.target.value) || 50;
                        handleDetailChange("packages", list);
                      }}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                {/* Conditional Prices Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(pkg.material_option === "with_material" || pkg.material_option === "both" || !pkg.material_option) && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Price Per Plate (With Material) (₹)</label>
                      <input
                        type="number"
                        value={pkg.price_per_plate}
                        placeholder="e.g. 1200"
                        onChange={(e) => {
                          const list = [...detailForm.packages];
                          list[idx].price_per_plate = parseFloat(e.target.value) || "";
                          handleDetailChange("packages", list);
                        }}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:border-gold"
                      />
                      {formErrors[`details.packages.${idx}.price_per_plate`] && (
                        <p className="text-[10px] text-red-500 font-semibold">{formErrors[`details.packages.${idx}.price_per_plate`]}</p>
                      )}
                    </div>
                  )}

                  {(pkg.material_option === "without_material" || pkg.material_option === "both") && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Price Per Plate (Without Material) (₹)</label>
                      <input
                        type="number"
                        value={pkg.price_per_plate_without_material ?? ""}
                        placeholder="e.g. 600"
                        onChange={(e) => {
                          const list = [...detailForm.packages];
                          list[idx].price_per_plate_without_material = parseFloat(e.target.value) || "";
                          handleDetailChange("packages", list);
                        }}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:border-gold"
                      />
                      {formErrors[`details.packages.${idx}.price_per_plate_without_material`] && (
                        <p className="text-[10px] text-red-500 font-semibold">{formErrors[`details.packages.${idx}.price_per_plate_without_material`]}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">
                    Configure Included Menu Items
                  </label>
                  
                  {/* Active Selections List */}
                  <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-xl bg-white min-h-[46px]">
                    {(() => {
                      const selections = pkg.menu_selections || parseDescriptionToSelections(pkg.description || "");
                      if (selections.length === 0) {
                        return <span className="text-xs text-gray-400 italic">No menu items configured yet. Choose a course and count below.</span>;
                      }
                      return selections.map((sel: any, sIdx: number) => (
                        <span
                          key={sIdx}
                          className="inline-flex items-center gap-1.5 bg-gold/10 text-gold border border-gold/20 text-xs px-2.5 py-1 rounded-lg font-semibold"
                        >
                          <span>
                            {sel.category === "Other" ? sel.customName : sel.category}
                            {sel.count && sel.count > 0 ? ` (${sel.count})` : ""}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = selections.filter((_: any, i: number) => i !== sIdx);
                              const list = [...detailForm.packages];
                              list[idx] = {
                                ...pkg,
                                menu_selections: updated,
                                description: formatSelectionsToDescription(updated)
                              };
                              handleDetailChange("packages", list);
                            }}
                            className="text-gray-400 hover:text-red-500 rounded-full transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ));
                    })()}
                  </div>

                  {/* Selection Form */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end bg-zinc-50/50 p-3 border border-gray-150 rounded-xl">
                    <div className="sm:col-span-4 space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase block">Course Menu</label>
                      <select
                        id={`sel-course-${idx}`}
                        defaultValue="Starters"
                        onChange={(e) => {
                          const otherEl = document.getElementById(`sel-other-div-${idx}`);
                          if (otherEl) {
                            if (e.target.value === "Other") {
                              otherEl.classList.remove("hidden");
                            } else {
                              otherEl.classList.add("hidden");
                            }
                          }
                        }}
                        className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-gray-900 focus:outline-none focus:border-gold"
                      >
                        {COURSE_TYPES.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>

                    <div id={`sel-other-div-${idx}`} className="sm:col-span-4 space-y-1 hidden">
                      <label className="text-[9px] font-bold text-gray-400 uppercase block">Custom Option Name</label>
                      <input
                        type="text"
                        id={`sel-custom-name-${idx}`}
                        placeholder="e.g. Mocktails, Ice Cream"
                        className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-gray-900 focus:outline-none focus:border-gold"
                      />
                    </div>

                    <div className="sm:col-span-4 space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase block">Count / Quantity</label>
                      <select
                        id={`sel-count-${idx}`}
                        defaultValue="1"
                        className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-gray-900 focus:outline-none focus:border-gold"
                      >
                        <option value="none">No Count (Optional)</option>
                        {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-4">
                      <button
                        type="button"
                        onClick={() => {
                          const courseEl = document.getElementById(`sel-course-${idx}`) as HTMLSelectElement;
                          const countEl = document.getElementById(`sel-count-${idx}`) as HTMLSelectElement;
                          const customNameEl = document.getElementById(`sel-custom-name-${idx}`) as HTMLInputElement;

                          const category = courseEl?.value || "Starters";
                          const countVal = countEl?.value;
                          const count = countVal === "none" ? undefined : parseInt(countVal, 10);
                          const customName = category === "Other" ? (customNameEl?.value.trim() || "Other") : undefined;

                          if (category === "Other" && !customName) return;

                          const selections = pkg.menu_selections || parseDescriptionToSelections(pkg.description || "");
                          const newSelection: MenuSelection = {
                            category,
                            customName,
                            count
                          };

                          const updated = [...selections, newSelection];
                          const list = [...detailForm.packages];
                          list[idx] = {
                            ...pkg,
                            menu_selections: updated,
                            description: formatSelectionsToDescription(updated)
                          };
                          handleDetailChange("packages", list);

                          if (customNameEl) customNameEl.value = "";
                        }}
                        className="w-full btn-gold rounded-lg py-1.5 text-xs font-semibold flex items-center justify-center gap-1 shadow-sm h-[32px]"
                      >
                        + Add Item
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {formErrors["details.packages"] && <p className="text-xs text-red-500 font-semibold">{formErrors["details.packages"]}</p>}

            <button
              type="button"
              onClick={() => {
                const list = [
                  ...(detailForm.packages || []),
                  { name: "", cuisine_type: "multi", tier: "medium", price_per_plate: "", min_plates: 80, description: "", material_option: "with_material", price_per_plate_without_material: "" }
                ];
                handleDetailChange("packages", list);
              }}
              className="w-full border border-dashed border-gray-300 py-3.5 rounded-xl hover:bg-slate-50 text-xs font-semibold text-gray-500 hover:text-black transition-all flex items-center justify-center gap-1"
            >
              + Create New Pricing Plan Tier
            </button>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 pt-3 border-t border-gray-100">
            <button
              onClick={handleBack}
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex items-center justify-center gap-1"
            >
              <ArrowLeft size={13} /> Back
            </button>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleSubmit("draft")}
                disabled={loading}
                className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-950 text-white flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                {loading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => handleSubmit("pending_approval")}
                disabled={loading}
                className="w-full sm:w-auto btn-gold rounded-xl text-xs font-bold px-6 py-3 flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                {loading ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                Publish for Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AddListingFormPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 text-gray-400">
        <Loader2 size={32} className="animate-spin text-gold" />
        <p className="text-sm">Loading dynamic listing form...</p>
      </div>
    }>
      <AddListingForm />
    </Suspense>
  );
}

