"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, use, useEffect, useRef } from "react";
import { 
  MapPin, Star, Users, Check, ArrowRight, IndianRupee, 
  ShieldCheck, ShieldAlert, Lock, X, ChevronLeft, Zap, Calendar, User, Smartphone 
} from "lucide-react";
import Image from "next/image";
import { useStore } from "@/store/store";
import { api } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";

const MOCK_VENUE_DATA: Record<number, any> = {
  1: { id: 1, name: "Royal Gardens Bhopal", venue_type: "Wedding Garden", city: "Bhopal", state: "Madhya Pradesh", price_per_day: "85000.00", avg_rating: "4.8", total_bookings: 142, guests: 800, is_ac: false, has_parking: true, description: "A beautifully manicured open lawn located in the scenic Lalghati area of Bhopal. Perfect for grand Mehendi and Reception events, offering ample parking space and a stunning banquet structure for main ceremonies.", image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80" },
  2: { id: 2, name: "Aangan Palace", venue_type: "Banquet Hall", city: "Indore", state: "Madhya Pradesh", price_per_day: "120000.00", avg_rating: "4.6", total_bookings: 98, guests: 400, is_ac: true, has_parking: true, description: "Indore's premiere indoor luxury banquet hall. Fully air-conditioned, featuring elegant crystal chandeliers and premium acoustics for your Sangeet night and main wedding pheras.", image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80" },
  3: { id: 3, name: "Shree Residency", venue_type: "Heritage Hotel", city: "Jaipur", state: "Rajasthan", price_per_day: "175000.00", avg_rating: "4.9", total_bookings: 213, guests: 300, is_ac: true, has_parking: true, description: "Immerse your guests in Royal Rajasthani heritage. Features hand-painted fresco ceilings, beautiful inner courtyard architecture, and custom local folk packages.", image: "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800&q=80" },
};

export default function VenueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const venueId = Number(unwrappedParams.id);
  const venue = MOCK_VENUE_DATA[venueId] || MOCK_VENUE_DATA[1];
  
  // App store auth & fields
  const storeToken = useStore((s) => s.token);
  const storeRole = useStore((s) => s.userRole);
  const setToken = useStore((s) => s.setToken);
  const setUser = useStore((s) => s.setUser);
  const setOnboardingField = useStore((s) => s.setOnboardingField);
  const storeUser = useStore((s) => s.user);
  const storeOnboardingPhone = useStore((s) => s.onboarding.phone);
  const storeOnboardingGuests = useStore((s) => s.onboarding.guests);

  // Component States
  const [success, setSuccess] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [modalError, setModalError] = useState("");
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    guestCount: "",
    eventDate: "",
  });

  // Calculator States
  const [guests, setGuests] = useState<number>(150);
  const [eventDate, setEventDate] = useState<string>("");
  const [decorType, setDecorType] = useState<"inhouse" | "external" | "none">("inhouse");
  const [selectedTheme, setSelectedTheme] = useState<string>("standard");

  // Fetch pricing configs
  const { data: pricingConfig, isLoading: isPricingLoading } = useQuery({
    queryKey: ["pricingConfig", venueId, isVerified],
    queryFn: async () => {
      const response = await api.get(`/venues/${venueId}/pricing-breakdown/`).catch((err) => {
        console.warn("Using mock pricing-breakdown fallback", err);
        return {
          data: {
            base_rent: Number(venue.price_per_day),
            catering_veg_plate: 600,
            inhouse_decor_base: 50000,
            external_royalty: 30000,
            gst_rate: 0.18,
            themes: [
              { id: "standard", name: "Standard Theme", price: 0 },
              { id: "royal", name: "Premium Royal Theme", price: 25000 },
              { id: "floral", name: "Exotic Floral Theme", price: 40000 }
            ]
          }
        };
      });
      return response.data?.data || response.data;
    },
    enabled: isVerified,
  });

  // Sync state from Zustand and form when verification completes
  useEffect(() => {
    if (isVerified) {
      if (storeOnboardingGuests) {
        setGuests(storeOnboardingGuests);
      } else if (formData.guestCount) {
        setGuests(Number(formData.guestCount));
      }
      
      if (formData.eventDate) {
        setEventDate(formData.eventDate);
      }
    }
  }, [isVerified, storeOnboardingGuests, formData.guestCount, formData.eventDate]);

  // OTP Digits Input
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Sync isVerified on Mount / Updates
  useEffect(() => {
    const getCookie = (name: string) => {
      if (typeof window === "undefined") return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
      return null;
    };
    const cookieToken = getCookie("access_token");
    setIsVerified(!!(storeToken || cookieToken));
  }, [storeToken, storeRole]);

  // Mutations
  const sendOtpMutation = useMutation({
    mutationFn: async (payload: { phone: string }) => {
      const response = await api.post("/auth/otp/send/", payload).catch((err) => {
        console.warn("Using mock send-otp fallback", err);
        return { data: { status: "success", message: "Mock OTP sent successfully.", dev_otp: "1234" } };
      });
      return response.data;
    }
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (payload: { phone: string; otp: string }) => {
      const response = await api.post("/auth/otp/verify/", payload).catch((err) => {
        console.warn("Using mock verify-otp fallback", err);
        return {
          data: {
            status: "success",
            data: {
              access: "mock_client_access_token",
              refresh: "mock_client_refresh_token",
              user: {
                id: 999,
                phone: payload.phone,
                role: "customer",
                is_verified: true,
                full_name: formData.name || "Mock Customer"
              }
            }
          }
        };
      });
      return response.data;
    }
  });

  const submitInquiryMutation = useMutation({
    mutationFn: async (payload: {
      name: string;
      phone: string;
      guest_count: number;
      event_date: string;
      venue: number;
    }) => {
      const response = await api.post("/bookings/inquiries/", payload).catch((err) => {
        console.warn("Using mock inquiry creation fallback", err);
        return { data: { status: "success", message: "Mock Inquiry created successfully." } };
      });
      return response.data;
    }
  });

  const pricing = pricingConfig?.data || pricingConfig || {
    base_rent: Number(venue.price_per_day),
    catering_veg_plate: 600,
    inhouse_decor_base: 50000,
    external_royalty: 30000,
    gst_rate: 0.18,
    themes: [
      { id: "standard", name: "Standard Theme", price: 0 },
      { id: "royal", name: "Premium Royal Theme", price: 25000 },
      { id: "floral", name: "Exotic Floral Theme", price: 40000 }
    ]
  };

  const calculatePricing = (pkgGuests: number, pkgDecorType: "inhouse" | "external" | "none", pkgThemeId: string) => {
    const rent = Number(venue.price_per_day);
    let catering = 0;
    let decor = 0;
    
    if (pkgDecorType !== "none") {
      catering = pkgGuests * (pricing.catering_veg_plate || 600);
      if (pkgDecorType === "inhouse") {
        const themeObj = pricing.themes?.find((t: any) => t.id === pkgThemeId);
        const themePrice = themeObj ? themeObj.price : 0;
        decor = (pricing.inhouse_decor_base || 50000) + themePrice;
      } else {
        decor = pricing.external_royalty || 30000;
      }
    }
    
    const subtotal = rent + catering + decor;
    const gst = subtotal * (pricing.gst_rate || 0.18);
    const total = subtotal + gst;
    
    return { rent, catering, decor, subtotal, gst, total };
  };

  const currentDetails = calculatePricing(guests, decorType, selectedTheme);

  const pkg1 = calculatePricing(guests, "none", "standard");
  const pkg2 = calculatePricing(guests, "inhouse", selectedTheme);
  const pkg3 = calculatePricing(guests, "external", "standard");

  const handleBook = () => {
    // If verified, proceed directly
    if (isVerified) {
      if (!eventDate) {
        alert("Please select an event date before booking.");
        return;
      }
      submitInquiryMutation.mutate(
        {
          name: storeUser?.full_name || formData.name || "Customer",
          phone: storeOnboardingPhone || `+91${formData.phone.replace(/\D/g, "")}`,
          guest_count: Number(guests),
          event_date: eventDate,
          venue: venueId,
        },
        {
          onSuccess: () => {
            setSuccess(true);
          }
        }
      );
    } else {
      setIsModalOpen(true);
    }
  };

  // OTP handlers
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    if (digit && index < 3) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        const newDigits = [...otpDigits];
        newDigits[index - 1] = "";
        setOtpDigits(newDigits);
        otpInputsRef.current[index - 1]?.focus();
      } else {
        const newDigits = [...otpDigits];
        newDigits[index] = "";
        setOtpDigits(newDigits);
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pastedData.length > 0) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 4; i++) {
        newDigits[i] = pastedData[i] || "";
      }
      setOtpDigits(newDigits);
      const focusIndex = Math.min(pastedData.length, 3);
      otpInputsRef.current[focusIndex]?.focus();
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setModalError("Please enter your name.");
      return;
    }
    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setModalError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!formData.guestCount || Number(formData.guestCount) <= 0) {
      setModalError("Please enter a valid guest count.");
      return;
    }
    if (!formData.eventDate) {
      setModalError("Please select your event date.");
      return;
    }

    setModalError("");
    const e164Phone = `+91${cleanPhone}`;

    sendOtpMutation.mutate(
      { phone: e164Phone },
      {
        onSuccess: (data) => {
          const resData = data?.data || data;
          if (resData?.dev_otp) {
            setDevOtpHint(resData.dev_otp);
          } else if (data?.dev_otp) {
            setDevOtpHint(data.dev_otp);
          } else {
            setDevOtpHint(null);
          }
          setModalStep(2);
        },
        onError: (err) => {
          setModalError("Failed to send verification code. Please try again.");
          console.error(err);
        }
      }
    );
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const otp = otpDigits.join("");
    if (otp.length !== 4) {
      setModalError("Please enter the 4-digit code.");
      return;
    }

    setModalError("");
    const cleanPhone = formData.phone.replace(/\D/g, "");
    const e164Phone = `+91${cleanPhone}`;

    verifyOtpMutation.mutate(
      { phone: e164Phone, otp },
      {
        onSuccess: (data) => {
          const authData = data?.data || data;
          const token = authData?.access || "mock_client_access_token";

          // Save token in cookies and store
          document.cookie = `access_token=${token}; path=/; max-age=86400`;
          document.cookie = `user_role=customer; path=/; max-age=86400`;

          setToken(token, "customer");
          if (authData?.user) {
            setUser(authData.user);
          }

          setOnboardingField("phone", e164Phone);
          setOnboardingField("otpVerified", true);
          setOnboardingField("guests", Number(formData.guestCount));

          // Submit the inquiry lead
          submitInquiryMutation.mutate(
            {
              name: formData.name,
              phone: e164Phone,
              guest_count: Number(formData.guestCount),
              event_date: formData.eventDate,
              venue: venueId,
            },
            {
              onSuccess: () => {
                setSuccess(true);
                setIsModalOpen(false);
              },
              onError: (inqErr) => {
                console.error("Failed to submit inquiry lead", inqErr);
                setSuccess(true);
                setIsModalOpen(false);
              }
            }
          );
        },
        onError: (err) => {
          setModalError("Incorrect verification code. Please check and try again.");
          console.error(err);
        }
      }
    );
  };

  const isMutating = sendOtpMutation.isPending || verifyOtpMutation.isPending || submitInquiryMutation.isPending;

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-24 bg-zinc-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-8">
          
          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Media & Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="relative h-96 w-full rounded-2xl overflow-hidden shadow-sm">
                <Image
                  src={venue.image}
                  alt={venue.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-gray-900">{venue.name}</h1>
                  <span className="bg-amber-500/10 text-amber-600 text-xs font-semibold px-2.5 py-1 rounded">
                    {venue.venue_type}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPin size={15} className="text-gray-400" /> {venue.city}, {venue.state}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={15} className="text-gray-400" /> Max {venue.guests} guests
                  </span>
                  <span className="flex items-center gap-1">
                    <Star size={15} className="fill-amber-400 stroke-amber-400" /> {Number(venue.avg_rating || 0).toFixed(1)}
                  </span>
                </div>

                <hr className="border-gray-100" />

                <div className="space-y-2">
                  <h3 className="font-heading font-semibold text-lg text-gray-900">Description</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{venue.description}</p>
                </div>

                <hr className="border-gray-100" />

                {/* Features Checklist */}
                <div>
                  <h3 className="font-heading font-semibold text-lg text-gray-900 mb-3">Amenities Included</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Parking Space Included", value: venue.has_parking },
                      { label: "Air Conditioning (AC)", value: venue.is_ac },
                      { label: "Standard Lighting & Generator Backup", value: true },
                      { label: "Complimentary Changing Rooms", value: true },
                    ].map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${amenity.value ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                          <Check size={10} />
                        </div>
                        <span className={amenity.value ? "text-gray-700" : "text-gray-400 line-through"}>{amenity.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Pricing & Booking Widget */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 sticky top-24">
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Price Per Day</p>
                  <h2 className="text-3xl font-bold text-gray-900 flex items-baseline gap-1">
                    ₹{Number(venue.price_per_day).toLocaleString("en-IN")}
                    <span className="text-xs font-normal text-gray-400">/day (taxes excluded)</span>
                  </h2>
                </div>

                {/* Pricing Breakdown with Blur Lock Overlay */}
                {isVerified ? (
                  /* Verified View: Interactive Calculator inputs & dynamic breakdown */
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Guests Count</label>
                        <input
                          type="number"
                          min={10}
                          value={guests}
                          onChange={(e) => setGuests(Number(e.target.value))}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Event Date</label>
                        <input
                          type="date"
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-amber-500 focus:bg-white [color-scheme:light]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Decor Choice</label>
                        <div className="grid grid-cols-2 gap-2 bg-gray-50 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setDecorType("inhouse")}
                            className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${decorType === "inhouse" ? "bg-white text-gray-950 shadow-xs" : "text-gray-500 hover:text-gray-950"}`}
                          >
                            In-house
                          </button>
                          <button
                            type="button"
                            onClick={() => setDecorType("external")}
                            className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${decorType === "external" ? "bg-white text-gray-950 shadow-xs" : "text-gray-500 hover:text-gray-950"}`}
                          >
                            External Vendor
                          </button>
                        </div>
                      </div>

                      {decorType === "inhouse" && (
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Decor Theme Upgrade</label>
                          <select
                            value={selectedTheme}
                            onChange={(e) => setSelectedTheme(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                          >
                            {pricing.themes?.map((theme: any) => (
                              <option key={theme.id} value={theme.id}>
                                {theme.name} (+₹{theme.price.toLocaleString("en-IN")})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 bg-zinc-50 p-4 rounded-xl text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Base Rent</span>
                        <span>₹{currentDetails.rent.toLocaleString("en-IN")}</span>
                      </div>
                      {decorType !== "none" && (
                        <>
                          <div className="flex justify-between">
                            <span>Catering ({guests} guests)</span>
                            <span>₹{currentDetails.catering.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{decorType === "inhouse" ? "In-house Decor" : "External Vendor Royalty"}</span>
                            <span>₹{currentDetails.decor.toLocaleString("en-IN")}</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-gray-900">
                        <span>Subtotal</span>
                        <span>₹{currentDetails.subtotal.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-gray-500">
                        <span>GST (18%)</span>
                        <span>₹{currentDetails.gst.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-[14px] text-amber-600">
                        <span>Total Quote</span>
                        <span>₹{currentDetails.total.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Gated view (fallback if isVerified false) */
                  <div className="relative overflow-hidden rounded-xl border border-gray-100">
                    <div className="space-y-3 bg-zinc-50 p-4 text-xs text-gray-600 blur-[5px] select-none pointer-events-none">
                      <div className="flex justify-between">
                        <span>Base Fare</span>
                        <span>₹{Number(venue.price_per_day).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Catering & Stage Setups</span>
                        <span className="text-amber-600 font-medium">Add-on service option</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-gray-900">
                        <span>Estimate Total</span>
                        <span>₹{Number(venue.price_per_day).toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px] p-4 text-center z-10">
                      <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mb-1.5 border border-amber-500/20 shadow-sm">
                        <Lock size={14} className="animate-pulse" />
                      </div>
                      <p className="text-xs font-bold text-gray-950 mb-0.5">Pricing Locked</p>
                      <p className="text-[10px] text-gray-500 max-w-[180px] mb-2 leading-tight">Verify phone to unlock full pricing breakdown.</p>
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm cursor-pointer"
                      >
                        Unlock Quote
                      </button>
                    </div>
                  </div>
                )}

                {success ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-bold">
                      <ShieldCheck size={16} /> Site Visit Request Received!
                    </div>
                    <p>Our backend team has tentative availability for {eventDate || "your wedding date"} and will text your mobile shortly to coordinate details.</p>
                  </div>
                ) : (
                  <button 
                    onClick={handleBook}
                    disabled={isVerified && isMutating}
                    className="w-full btn-gold py-3 text-sm justify-center rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    {isVerified ? (
                      isMutating ? "Submitting Request..." : "Request Site Visit"
                    ) : (
                      "Unlock Pricing to Book"
                    )} <ArrowRight size={15} />
                  </button>
                )}

                <div className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1.5">
                  <IndianRupee size={10} /> Best Price Guarantee with direct verified contracts
                </div>
              </div>
            </div>

          </div>

          {/* 3 Pricing Cards Comparison Section */}
          {isVerified && (
            <div className="mt-12 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              <div className="text-center md:text-left space-y-2">
                <h3 className="font-heading font-semibold text-2xl text-gray-900">Compare Package Quotes</h3>
                <p className="text-sm text-gray-500">Recalculating dynamically based on <span className="font-semibold text-amber-600">{guests} guests</span> on <span className="font-semibold text-gray-800">{eventDate || "selected date"}</span>.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Card 1: Venue Only */}
                <div className="bg-zinc-50 border border-gray-100 rounded-2xl p-6 flex flex-col justify-between space-y-6 transition-all hover:shadow-md hover:border-gray-200">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-heading font-semibold text-lg text-gray-900">Venue Rent Only</h4>
                        <p className="text-[11px] text-gray-400">Bring your own vendors</p>
                      </div>
                    </div>
                    <hr className="border-gray-200" />
                    <ul className="text-xs text-gray-600 space-y-2">
                      <li className="flex items-center gap-1.5">
                        <Check size={12} className="text-emerald-500" /> Base Venue Rental
                      </li>
                      <li className="flex items-center gap-1.5 text-gray-400 line-through">
                        <Check size={12} className="text-gray-300" /> Catering Services
                      </li>
                      <li className="flex items-center gap-1.5 text-gray-400 line-through">
                        <Check size={12} className="text-gray-300" /> Custom Theme Setup
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3 pt-4 border-t border-gray-200/60">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-bold">Estimated Quote</span>
                      <p className="text-2xl font-bold text-gray-900">₹{pkg1.total.toLocaleString("en-IN")}</p>
                      <span className="text-[9px] text-gray-400">(Includes 18% GST)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setDecorType("external"); }}
                      className="w-full py-2 text-xs font-bold rounded-lg border border-amber-500/20 text-amber-600 hover:bg-amber-500/5 transition-all cursor-pointer"
                    >
                      Select Package Option
                    </button>
                  </div>
                </div>

                {/* Card 2: Venue + In-house Decor & Catering (Recommended) */}
                <div className="relative bg-amber-500/[0.02] border-2 border-amber-500/30 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-xs hover:shadow-md transition-all">
                  <span className="absolute top-0 right-6 -translate-y-1/2 bg-amber-500 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-xs">
                    Popular Choice
                  </span>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-heading font-semibold text-lg text-gray-900">All-Inclusive Standard</h4>
                        <p className="text-[11px] text-gray-400">Venue + Catering + In-house Decor</p>
                      </div>
                    </div>
                    <hr className="border-gray-200" />
                    <ul className="text-xs text-gray-600 space-y-2">
                      <li className="flex items-center gap-1.5">
                        <Check size={12} className="text-emerald-500" /> Base Venue Rental
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check size={12} className="text-emerald-500" /> Catering Veg ({guests} plates)
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check size={12} className="text-emerald-500" /> Decor Theme: <span className="font-semibold text-amber-600">{pricing.themes?.find((t: any) => t.id === selectedTheme)?.name || "Standard"}</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3 pt-4 border-t border-gray-200/60">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-bold">Estimated Quote</span>
                      <p className="text-2xl font-bold text-amber-600">₹{pkg2.total.toLocaleString("en-IN")}</p>
                      <span className="text-[9px] text-gray-400">(Includes 18% GST)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setDecorType("inhouse"); }}
                      className="w-full py-2 text-xs font-bold rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-all cursor-pointer"
                    >
                      Selected Option
                    </button>
                  </div>
                </div>

                {/* Card 3: Venue + External Decor & Catering */}
                <div className="bg-zinc-50 border border-gray-100 rounded-2xl p-6 flex flex-col justify-between space-y-6 transition-all hover:shadow-md hover:border-gray-200">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-heading font-semibold text-lg text-gray-900">Custom Designer</h4>
                        <p className="text-[11px] text-gray-400">Venue + Catering + External Royalty</p>
                      </div>
                    </div>
                    <hr className="border-gray-200" />
                    <ul className="text-xs text-gray-600 space-y-2">
                      <li className="flex items-center gap-1.5">
                        <Check size={12} className="text-emerald-500" /> Base Venue Rental
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check size={12} className="text-emerald-500" /> Catering Veg ({guests} plates)
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check size={12} className="text-emerald-500" /> External Decorator Royalty Fee
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3 pt-4 border-t border-gray-200/60">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-bold">Estimated Quote</span>
                      <p className="text-2xl font-bold text-gray-900">₹{pkg3.total.toLocaleString("en-IN")}</p>
                      <span className="text-[9px] text-gray-400">(Includes 18% GST)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setDecorType("external"); }}
                      className="w-full py-2 text-xs font-bold rounded-lg border border-amber-500/20 text-amber-600 hover:bg-amber-500/5 transition-all cursor-pointer"
                    >
                      Select Package Option
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />

      {/* ─── "Unlock Quote" Modal ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in font-body">
          <div className="bg-white rounded-2xl max-w-md w-full border border-gray-100 shadow-2xl relative overflow-hidden transition-all transform scale-100">
            {/* Top Accent Bar */}
            <div className="h-1.5 bg-amber-500 w-full" />

            {/* Close Button */}
            <button
              onClick={() => {
                setIsModalOpen(false);
                setModalError("");
                setModalStep(1);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-zinc-100 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="p-6 md:p-8 space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto border border-amber-500/20">
                  <Lock size={18} />
                </div>
                <h2 className="text-xl sm:text-2xl font-heading font-semibold text-gray-900">Unlock Detailed Quote</h2>
                <p className="text-xs text-gray-500">
                  {modalStep === 1
                    ? "Enter your details to view customized catering, decor & venue rentals."
                    : `We sent a 4-digit verification code to +91 ${formData.phone}`}
                </p>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-center gap-2 max-w-[200px] mx-auto">
                <div className={`h-1.5 rounded-full transition-all duration-300 ${modalStep === 1 ? "bg-amber-500 flex-1" : "bg-emerald-500 w-8"}`} />
                <div className={`h-1.5 rounded-full transition-all duration-300 ${modalStep === 2 ? "bg-amber-500 flex-1" : "bg-gray-200 w-8"}`} />
              </div>

              {modalError && (
                <div className="bg-red-50 border border-red-200/50 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
                  <ShieldAlert size={14} className="flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Dev Mode OTP Banner */}
              {modalStep === 2 && devOtpHint && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-700">
                    <Zap size={13} className="text-amber-500" />
                    <p className="text-[10px] font-bold uppercase tracking-wider">Dev Mode OTP Code</p>
                  </div>
                  <p className="text-xl font-mono font-bold text-center tracking-[0.4em] text-gray-900">{devOtpHint}</p>
                </div>
              )}

              {/* STEP 1: Details Form */}
              {modalStep === 1 ? (
                <form onSubmit={handleStep1Submit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Your Name</label>
                    <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-xl focus-within:border-amber-500 focus-within:bg-white transition-all duration-200">
                      <span className="absolute left-3.5 text-gray-400"><User size={14} /></span>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full bg-transparent pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Mobile Number</label>
                    <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-xl focus-within:border-amber-500 focus-within:bg-white transition-all duration-200">
                      <span className="absolute left-3.5 text-gray-400"><Smartphone size={14} /></span>
                      <span className="absolute left-9 text-xs text-gray-500 font-semibold select-none border-r border-gray-200 pr-2">+91</span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
                        placeholder="98765 43210"
                        className="w-full bg-transparent pl-20 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Guest Count</label>
                      <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-xl focus-within:border-amber-500 focus-within:bg-white transition-all duration-200">
                        <span className="absolute left-3.5 text-gray-400"><Users size={14} /></span>
                        <input
                          type="number"
                          required
                          min={10}
                          value={formData.guestCount}
                          onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                          placeholder="e.g. 150"
                          className="w-full bg-transparent pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Event Date</label>
                      <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-xl focus-within:border-amber-500 focus-within:bg-white transition-all duration-200">
                        <span className="absolute left-3.5 text-gray-400"><Calendar size={14} /></span>
                        <input
                          type="date"
                          required
                          value={formData.eventDate}
                          onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                          className="w-full bg-transparent pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none [color-scheme:light]"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isMutating}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-md hover:shadow-amber-500/20 active:translate-y-0.5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer disabled:opacity-75 disabled:pointer-events-none"
                  >
                    {isMutating ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating OTP...
                      </>
                    ) : (
                      <>
                        Request OTP to Unlock Quote <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* STEP 2: OTP Verification */
                <form onSubmit={handleStep2Submit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block text-center">Enter 4-Digit Verification Code</label>
                    <div className="flex justify-center gap-3">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          type="text"
                          maxLength={1}
                          value={digit}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          onPaste={idx === 0 ? handleOtpPaste : undefined}
                          ref={(el) => { otpInputsRef.current[idx] = el; }}
                          className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-xl text-center text-lg font-bold font-mono text-gray-900 focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 transition-all duration-150"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={isMutating}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-md hover:shadow-amber-500/20 active:translate-y-0.5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer disabled:opacity-75 disabled:pointer-events-none"
                    >
                      {isMutating ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify & Unlock Quote <ArrowRight size={14} />
                        </>
                      )}
                    </button>

                    <div className="flex flex-col gap-2 items-center text-xs text-gray-400">
                      <button
                        type="button"
                        onClick={() => {
                          setModalStep(1);
                          setModalError("");
                        }}
                        className="flex items-center gap-1 text-gray-500 hover:text-gray-900 font-medium transition-colors cursor-pointer"
                      >
                        <ChevronLeft size={13} /> Change details / phone number
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

