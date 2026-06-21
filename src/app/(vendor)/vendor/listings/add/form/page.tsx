"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, ArrowRight, Save, CheckCircle, Store, Music, 
  Camera, Sparkles, Utensils, Flower, Calendar, Upload, X, Loader2, AlertCircle 
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

  // Image Upload State
  const [images, setImages] = useState<{ file?: File; preview: string }[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

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
          tier: "medium",
          price_per_plate: "",
          min_plates: 100,
          description: "",
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
      } else if (type === "caterer") {
        if (!detailForm.name?.trim()) errors["details.name"] = "Package Name is required";
        if (!detailForm.price_per_plate) errors["details.price_per_plate"] = "Price per plate is required";
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
    if (!validateStep(1) || !validateStep(2)) {
      setStep(1);
      return;
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

    // Prepopulate package names for DJ, Caterer, Decorator details if blank
    if (["dj", "caterer", "decorator"].includes(type) && !payload.details.name) {
      payload.details.name = baseForm.name;
    }

    // Convert decimal strings to numbers for serialization safety
    if (payload.details.base_package_price) payload.details.base_package_price = parseFloat(payload.details.base_package_price);
    if (payload.details.bridal_package_price) payload.details.bridal_package_price = parseFloat(payload.details.bridal_package_price);
    if (payload.details.party_makeup_price) payload.details.party_makeup_price = parseFloat(payload.details.party_makeup_price);
    if (payload.details.budget_min) payload.details.budget_min = parseFloat(payload.details.budget_min);
    if (payload.details.budget_max) payload.details.budget_max = parseFloat(payload.details.budget_max);
    if (payload.details.price_per_day) payload.details.price_per_day = parseFloat(payload.details.price_per_day);
    if (payload.details.price) payload.details.price = parseFloat(payload.details.price);
    if (payload.details.price_per_plate) payload.details.price_per_plate = parseFloat(payload.details.price_per_plate);

    if (payload.details.team_size) payload.details.team_size = parseInt(payload.details.team_size);
    if (payload.details.delivery_days_limit) payload.details.delivery_days_limit = parseInt(payload.details.delivery_days_limit);
    if (payload.details.min_capacity) payload.details.min_capacity = parseInt(payload.details.min_capacity);
    if (payload.details.max_capacity) payload.details.max_capacity = parseInt(payload.details.max_capacity);
    if (payload.details.hours) payload.details.hours = parseInt(payload.details.hours);
    if (payload.details.min_plates) payload.details.min_plates = parseInt(payload.details.min_plates);
    if (payload.details.num_ac_rooms !== undefined) payload.details.num_ac_rooms = parseInt(payload.details.num_ac_rooms) || 0;
    if (payload.details.num_non_ac_rooms !== undefined) payload.details.num_non_ac_rooms = parseInt(payload.details.num_non_ac_rooms) || 0;
    if (payload.details.num_halls !== undefined) payload.details.num_halls = parseInt(payload.details.num_halls) || 0;

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
        setErrorMsg(err.response?.data?.message || "An unexpected error occurred. Please try again.");
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
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Step {step} of 3</p>
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

      {/* STEP 2: CATEGORY SPECIFIC DETAILS */}
      {step === 2 && (
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
                    value={detailForm.tier}
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

          {/* CATERING DETAIL FORM */}
          {type === "caterer" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Catering Package Name</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Silver Buffet Menu, Premium Fusion Cuisine"
                  value={detailForm.name}
                  onChange={(e) => handleDetailChange("name", e.target.value)}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white ${
                    formErrors["details.name"] ? "border-red-400" : "border-gray-200 text-gray-900"
                  }`}
                />
                {formErrors["details.name"] && <p className="text-[10px] text-red-500 font-semibold">{formErrors["details.name"]}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Cuisine Category</label>
                  <select
                    value={detailForm.cuisine_type}
                    onChange={(e) => handleDetailChange("cuisine_type", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white text-gray-900"
                  >
                    {CUISINE_CHOICES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Service Tier</label>
                  <select
                    value={detailForm.tier}
                    onChange={(e) => handleDetailChange("tier", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white text-gray-900"
                  >
                    {TIER_CHOICES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Price Per Plate (INR) (₹)</label>
                  <input
                    type="number"
                    value={detailForm.price_per_plate}
                    placeholder="e.g. 500"
                    onChange={(e) => handleDetailChange("price_per_plate", e.target.value)}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white ${
                      formErrors["details.price_per_plate"] ? "border-red-400" : "border-gray-200 text-gray-900"
                    }`}
                  />
                  {formErrors["details.price_per_plate"] && <p className="text-[10px] text-red-500 font-semibold">{formErrors["details.price_per_plate"]}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Minimum Plates Required</label>
                  <input
                    type="number"
                    min={20}
                    value={detailForm.min_plates}
                    onChange={(e) => handleDetailChange("min_plates", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] bg-white text-gray-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Menu Items & Descriptions</label>
                <textarea
                  value={detailForm.description}
                  rows={4}
                  placeholder="e.g. Starters: Paneer Tikka, Veg Spring Rolls. Main Course: Paneer Butter Masala, Mix Veg, Butter Naan, Veg Pulao. Dessert: Gulab Jamun with Ice Cream."
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

      {/* STEP 3: MEDIA UPLOAD & SUBMIT */}
      {step === 3 && (
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

