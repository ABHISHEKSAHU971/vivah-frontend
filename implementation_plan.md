# Decoration Vendor Listing — Multi-Package Onboarding

Mirror the Catering multi-step onboarding wizard so Decoration vendors can list
**multiple decoration packages** (each with its own style theme, inclusions, and
4-tier pricing), just like Catering vendors list multiple packages + branches +
menu items. Both backend and frontend must be consistent and use shared patterns.

---

## What's Changing (Gap Analysis)

| Concern | Catering (current) | Decoration (current) | Decoration (target) |
|---|---|---|---|
| # packages per listing | Multiple ✅ | One (1:1 OneToOne) ❌ | Multiple ✅ |
| Listing → Package relation | ForeignKey (many) | OneToOne | ForeignKey (many) |
| Steps in wizard | 4 steps | 2 steps | 4 steps |
| Package-level tiers | N/A | DecorationTier (per pkg) | DecorationTier (per pkg) ✅ |
| Serializer handling | list of packages | Single DecorationPackageSerializer | list of packages |
| Repository create/update | Full packages loop | Simple `**details_data` spread | Packages loop + tiers |

---

## User Review Required

> [!IMPORTANT]
> **Model change needed:** `DecorationPackage.listing` is currently a `OneToOneField`.
> To support multiple packages per listing we must change it to a `ForeignKey`.
> This is a **Django migration** — the DB column changes from a unique constraint to
> a non-unique FK. No data is lost (existing single rows are preserved).

> [!WARNING]
> The existing `DecorationPackageViewSet` in `decorations/controllers/__init__.py`
> uses `permission_classes = [AllowAny]` — it is an old public endpoint used by the
> booking/venue flow. We will **not** touch those endpoints; the new vendor-facing
> listing pipeline uses the existing `ListingSerializer` + `ListingRepository` path.

---

## Open Questions

> [!IMPORTANT]
> **1. Branches for Decoration?**
> Catering has branch locations (e.g. Main Branch in different cities). Should
> Decoration also allow multiple service locations / coverage areas?
> *Default plan:* No — decoration is mobile; we'll add a simple "service area" text
> field instead of the full branch manager.

> [!IMPORTANT]
> **2. Image per package or per listing?**
> Currently the listing has one cover image. Each `DecorationPackage` also has an
> optional `image` field. Should vendors be able to upload a per-package image during
> onboarding?
> *Default plan:* Yes — Step 3 will allow one cover image per package (optional).

---

## Proposed Changes

### Backend — `apps/decorations/models/`

#### [MODIFY] [decoration.py](file:///d:/PlanMyvivah/celebrationplatform/apps/decorations/models/decoration.py)

Change `listing` from `OneToOneField` → `ForeignKey`:

```python
listing = models.ForeignKey(
    'listings.BaseListing',
    on_delete=models.SET_NULL,
    null=True, blank=True,
    related_name='decoration_packages'   # was 'decoration_details'
)
```

> **related_name** changes from `decoration_details` → `decoration_packages` to
> match the pattern used by `catering_packages` and `dj_packages`.

---

### Backend — Migration

#### [NEW] `apps/decorations/migrations/0003_decoration_listing_fk.py` (auto-generated)

Run: `python manage.py makemigrations decorations`

---

### Backend — `apps/listings/`

#### [MODIFY] [listing_repository.py](file:///d:/PlanMyvivah/celebrationplatform/apps/listings/repositories/listing_repository.py)

**`list_by_vendor` prefetch** — change `'decoration_details'` → `'decoration_packages'`.

**`create_listing` — `decorator` branch** (Line 151-152): Replace the single
`DecorationPackage.objects.create(listing=listing, vendor=vendor_profile, **details_data)`
with a loop over `details_data['packages']`, creating one `DecorationPackage` +
its `DecorationTier` children per package:

```python
elif service_type == 'decorator':
    from apps.decorations.models.decoration_tier import DecorationTier
    packages = details_data.get('packages', [])
    for p in packages:
        tiers = p.pop('tiers', [])
        pkg = DecorationPackage.objects.create(
            listing=listing, vendor=vendor_profile, **p
        )
        for t in tiers:
            DecorationTier.objects.create(package=pkg, **t)
```

**`update_listing` — `decorator` branch** (Line 286-287): Same loop pattern with
delete-and-recreate (matching catering behavior):

```python
elif service_type == 'decorator':
    from apps.decorations.models.decoration_tier import DecorationTier
    packages = details_data.get('packages', [])
    DecorationPackage.objects.filter(listing=listing).delete()  # cascade deletes tiers
    for p in packages:
        tiers = p.pop('tiers', [])
        pkg = DecorationPackage.objects.create(
            listing=listing, vendor=vendor_profile, **p
        )
        for t in tiers:
            DecorationTier.objects.create(package=pkg, **t)
```

#### [MODIFY] [listing_serializer.py](file:///d:/PlanMyvivah/celebrationplatform/apps/listings/serializers/listing_serializer.py)

**`get_details` — `decorator` branch** (Lines 76-78): Change from single-object
serialization to list (mirrors catering):

```python
elif obj.service_type == 'decorator':
    packages = obj.decoration_packages.all()
    return DecorationPackageSerializer(packages, many=True).data
```

**`validate` — `decorator` branch** (Lines 139-140): Change from single
`DecorationPackageSerializer` to the same list-validation pattern used by `dj`:

```python
elif service_type == 'decorator':
    packages = details_copy.get('packages', [])
    if not isinstance(packages, list) or len(packages) == 0:
        raise serializers.ValidationError({'details': 'At least one package is required.'})
    validated_packages = []
    for idx, pkg in enumerate(packages):
        tiers = pkg.get('tiers', [])
        pkg_serializer = DecorationPackageSerializer(data=pkg, partial=self.partial)
        pkg_serializer.fields['listing'].required = False
        pkg_serializer.fields['vendor'].required = False
        if not pkg_serializer.is_valid():
            raise serializers.ValidationError({'details': pkg_serializer.errors})
        pkg_val = pkg_serializer.validated_data
        pkg_val['tiers'] = tiers  # pass raw tiers through
        validated_packages.append(pkg_val)
    self.context['validated_details'] = {'packages': validated_packages}
    serializer = None  # skip further serialization
```

---

### Backend — `apps/decorations/serializers/__init__.py`

#### [MODIFY] [__init__.py](file:///d:/PlanMyvivah/celebrationplatform/apps/decorations/serializers/__init__.py)

Add a write serializer (`DecorationPackageWriteSerializer`) that excludes read-only
nested fields (tiers) for create validation. The existing `DecorationPackageSerializer`
stays as-is for reading (it embeds tiers via `DecorationTierSerializer`).

---

### Frontend — `src/app/(vendor)/vendor/listings/add/form/page.tsx`

This is the big change. The decorator path is upgraded from **2 steps → 4 steps**
(matching caterer's 4-step flow with adjusted content).

#### Step architecture for `type === "decorator"`

| Step | Title | Content |
|---|---|---|
| 1 | General Info | (shared — existing, no change) |
| 2 | Business Profile & Coverage | Service area / styles / min budget |
| 3 | Decoration Package Builder | Multiple packages with tiers (add/remove) |
| 4 | Media Showcase & Submit | Image upload + draft/publish |

#### State changes

```ts
// New state for decorator
const [decoratorTab, setDecoratorTab] = useState("packages");

// detailForm for 'decorator' (updated initializer)
{
  styles_offered: ["floral"],   // multi-select checkboxes (like cuisines)
  min_budget: "",               // minimum booking budget
  service_area: "",             // text field
  packages: [
    {
      name: "",
      style: "floral",
      description: "",
      includes: [],
      tiers: [
        { tier: "low",     price: "", description: "", max_area_sqft: "" },
        { tier: "medium",  price: "", description: "", max_area_sqft: "" },
        { tier: "average", price: "", description: "", max_area_sqft: "" },
        { tier: "high",    price: "", description: "", max_area_sqft: "" },
      ]
    }
  ]
}
```

#### Step indicator update

The step counter already shows `type === "caterer" ? 4 : 3`.
This becomes:

```tsx
{type === "caterer" || type === "decorator" ? 4 : 3}
```

#### `validateStep` additions

```ts
} else if (type === "decorator") {
  if (currentStep === 3) {
    if (!detailForm.packages || detailForm.packages.length === 0) {
      errors["details.packages"] = "Create at least one decoration package";
    } else {
      detailForm.packages.forEach((pkg: any, idx: number) => {
        if (!pkg.name?.trim()) errors[`details.packages.${idx}.name`] = "Package name is required";
      });
    }
  }
}
```

#### `handleSubmit` payload coercion

```ts
if (type === "decorator" && payload.details.packages) {
  payload.details.packages = payload.details.packages.map((pkg: any) => ({
    ...pkg,
    tiers: (pkg.tiers || []).map((t: any) => ({
      ...t,
      price: parseFloat(t.price) || 0,
      max_area_sqft: t.max_area_sqft ? parseInt(t.max_area_sqft) : null,
    }))
  }));
}
```

#### New Step 2 — Business Profile & Coverage (decorator)

- **Styles Offered** — chip/checkbox multi-select (same pattern as Cuisines Offered in caterer step 2) using `DECORATOR_STYLES`
- **Min Budget** — number input (like Min Guest Capacity)
- **Service Area** — text input ("Bhopal, Indore, Jabalpur")
- Image upload inline (same as caterer step 1 image upload block)

#### New Step 3 — Package Builder (decorator)

- **Per-package card** with collapse/expand (package name, style dropdown, description, inclusions tag input)
- **Tiers sub-table** (identical to existing tiers table, but now nested inside each package card)
- **"+ Add Package" button** at bottom
- **Remove package** X button per card

Uses the same pattern as the caterer's packages step (Step 4), adapted for decoration fields.

#### Existing Step 2 decorator block (Lines 1972-2116)

This block is **replaced** — the current single-package Step 2 decorator form is removed, and Steps 2, 3, 4 are injected in its place.

---

## Shared / Reused Components (No Duplication)

| Pattern | Catering | Decoration | Shared? |
|---|---|---|---|
| Branch/location manager | ✅ Caterer Step 2 | ❌ (service area text only) | Inline |
| Tag-input for inclusions | ❌ | ✅ existing decorator block | Reused as-is |
| Tiers table | ✅ existing decoration block | Expanded per-package | Extracted to inline fn |
| Cuisine/style chip selector | ✅ Caterer Step 2 | ✅ Decorator Step 2 | Same CSS pattern |
| Image upload | ✅ caterer step 1 | ✅ decorator step 4 | Same HTML block |
| Package add/remove | ✅ dj packages | ✅ decorator packages | Same pattern |

All UI uses the existing design system (`.btn-gold`, `border-gray-200`, `rounded-xl`, `font-heading`, gold focus rings). **No new CSS classes needed.**

---

## Verification Plan

### Backend Tests (manual via API)
1. `POST /api/listings/` with `service_type=decorator` + `details.packages` array → expect 201
2. `GET /api/listings/{id}/` → `details` is an array of packages with nested `tiers`
3. `PATCH /api/listings/{id}/` → packages updated, old tiers deleted
4. Confirm migration runs cleanly on existing DB

### Frontend Smoke Test
1. Navigate to `/vendor/listings/add?type=decorator`
2. Complete 4-step wizard
3. Verify listing appears in `/vendor/listings` with correct package count
4. Verify no console errors or API validation failures

### Regression Check
- Existing caterer listing create/edit: must continue to work unchanged
- Existing DJ listing create/edit: must continue to work unchanged
- Public `DecorationPackageViewSet` endpoints (`/api/decorations/`) still accessible

---
