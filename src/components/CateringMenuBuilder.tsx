"use client";

/** Mirrors CateringMenuItem.COURSE_CHOICES on the backend. */
const COURSE_LABELS: Record<string, string> = {
  starter: "Starters",
  live: "Live Counters",
  soup: "Soups",
  special_veg: "Special Veg",
  seasonal_veg: "Seasonal Veg",
  dal: "Dal",
  rice: "Rice",
  breads: "Bread Varieties",
  dessert: "Desserts",
  welcome: "Welcome Drinks",
  special_additions: "Special Additions",
  other: "Others",
  // Older packages may still carry these codes.
  main: "Main Course",
  paneer_dish: "Paneer Dishes",
};

/** "some_new_course" -> "Some New Course", so an unmapped code still reads well. */
function courseLabel(code: string): string {
  return (
    COURSE_LABELS[code] ||
    code.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
  );
}

/** Show courses in menu order rather than whatever order the API returned. */
const COURSE_ORDER = [
  "welcome", "live", "soup", "starter", "special_veg", "seasonal_veg",
  "dal", "rice", "breads", "dessert", "special_additions", "main",
  "paneer_dish", "other",
];

export interface MenuItem {
  id: number;
  name: string;
  course: string;
  addon_price?: string | number;
  description?: string;
}

export interface MenuPackage {
  id: number;
  name: string;
  menu_items?: MenuItem[];
  course_sections?: Record<string, { min: number; max: number }>;
}

/**
 * Dish picker for the selected catering package. Each course has a max; picking
 * past it swaps out the oldest choice rather than blocking the click, so the
 * customer never has to untick something first.
 */
export default function CateringMenuBuilder({
  pkg,
  selectedIds,
  onChange,
}: {
  pkg: MenuPackage;
  selectedIds: number[];
  onChange: (next: number[]) => void;
}) {
  const items = pkg.menu_items ?? [];
  if (items.length === 0) return null;

  const grouped = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    (acc[item.course] ||= []).push(item);
    return acc;
  }, {});

  const courses = Object.entries(grouped).sort(([a], [b]) => {
    const ia = COURSE_ORDER.indexOf(a);
    const ib = COURSE_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  const toggle = (item: MenuItem, courseItems: MenuItem[], max: number) => {
    if (selectedIds.includes(item.id)) {
      onChange(selectedIds.filter((id) => id !== item.id));
      return;
    }
    const chosenInCourse = courseItems.filter((it) => selectedIds.includes(it.id));
    if (chosenInCourse.length >= max && chosenInCourse[0]) {
      // At the limit — drop the oldest pick in this course and take the new one.
      onChange([...selectedIds.filter((id) => id !== chosenInCourse[0].id), item.id]);
      return;
    }
    onChange([...selectedIds, item.id]);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-heading font-semibold text-base text-gray-900">Build your menu</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Pick dishes for each course. Premium picks show a per-plate add-on and update your quote live.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map(([course, courseItems]) => {
          const limit = pkg.course_sections?.[course] || { min: 1, max: 4 };
          const chosen = courseItems.filter((it) => selectedIds.includes(it.id)).length;
          const atLimit = chosen >= limit.max;

          return (
            <div key={course} className="bg-white p-4 rounded-2xl border border-gray-100 space-y-3">
              <div className="flex justify-between items-center gap-2">
                <span className="font-semibold text-[13px] text-gray-900">
                  {courseLabel(course)}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    atLimit
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {chosen} / {limit.max}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {courseItems.map((item) => {
                  const checked = selectedIds.includes(item.id);
                  const addon = Number(item.addon_price) || 0;
                  return (
                    <label
                      key={item.id}
                      className={`px-3 py-2 rounded-xl border text-xs flex justify-between items-start gap-2.5 cursor-pointer transition-all ${
                        checked
                          ? "bg-gold/5 border-gold"
                          : "bg-gray-50/60 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="flex gap-2 min-w-0">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(item, courseItems, limit.max)}
                          className="mt-0.5 accent-[#C9A440] shrink-0"
                        />
                        <span className="min-w-0">
                          <span className="block text-gray-800 leading-tight">{item.name}</span>
                          {item.description && (
                            <span className="block text-[10px] text-gray-400 mt-0.5">{item.description}</span>
                          )}
                        </span>
                      </span>
                      {addon > 0 && (
                        <span className="text-[10px] font-bold text-gold shrink-0">+₹{addon}</span>
                      )}
                    </label>
                  );
                })}
              </div>

              {atLimit && (
                <p className="text-[10px] text-gray-400">
                  At the limit — picking another swaps out your first choice.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
