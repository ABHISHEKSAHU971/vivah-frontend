export const INDIAN_STATES = [
  "Madhya Pradesh",
  "Maharashtra",
  "Rajasthan",
  "Uttar Pradesh",
  "Gujarat",
  "Delhi",
  "Karnataka",
  "Tamil Nadu",
] as const;

export const CITIES_BY_STATE: Record<string, string[]> = {
  "Madhya Pradesh": [
    "Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas",
    "Satna", "Ratlam", "Rewa", "Khandwa", "Burhanpur", "Guna", "Shivpuri",
    "Chhindwara", "Vidisha", "Mandsaur", "Neemuch", "Hoshangabad", "Itarsi",
    "Bhind", "Morena", "Singrauli", "Katni", "Damoh",
  ],
  Maharashtra: [
    "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur",
    "Amravati", "Kolhapur", "Thane", "Navi Mumbai", "Nanded", "Sangli",
  ],
  Rajasthan: [
    "Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner",
    "Alwar", "Bhilwara", "Sikar", "Bharatpur",
  ],
  "Uttar Pradesh": [
    "Lucknow", "Kanpur", "Agra", "Varanasi", "Prayagraj", "Meerut",
    "Ghaziabad", "Noida", "Bareilly", "Aligarh", "Moradabad", "Jhansi",
  ],
  Gujarat: [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar",
    "Gandhinagar", "Junagadh", "Anand",
  ],
  Delhi: [
    "New Delhi", "Dwarka", "Rohini", "Saket", "Karol Bagh", "Connaught Place",
    "Laxmi Nagar", "Janakpuri",
  ],
  Karnataka: [
    "Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi", "Kalaburagi",
    "Davangere", "Ballari",
  ],
  "Tamil Nadu": [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
    "Tirunelveli", "Erode", "Vellore",
  ],
};

export function citiesForState(state: string): string[] {
  return CITIES_BY_STATE[state] || [];
}
