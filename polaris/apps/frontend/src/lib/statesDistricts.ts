export interface StateData {
  name: string;
  districts: string[];
}

export const INDIA_STATES: StateData[] = [
  {
    name: "Andhra Pradesh",
    districts: ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Kadapa", "Rajahmundry", "Kakinada", "Anantapur"],
  },
  {
    name: "Assam",
    districts: ["Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Nagaon", "Tinsukia", "Lakhimpur", "Sivasagar"],
  },
  {
    name: "Bihar",
    districts: ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Purnia", "Ara", "Begusarai", "Katihar", "Munger"],
  },
  {
    name: "Chandigarh (UT)",
    districts: ["Chandigarh"],
  },
  {
    name: "Chhattisgarh",
    districts: ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon", "Jagdalpur"],
  },
  {
    name: "Delhi",
    districts: ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],
  },
  {
    name: "Goa",
    districts: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  },
  {
    name: "Gujarat",
    districts: ["Ahmedabad", "Surat", "Vadodara (Baroda)", "Rajkot", "Gandhinagar", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhidham (Kutch)", "Anand", "Navsari", "Valsad", "Mehsana", "Patan", "Amreli", "Surendranagar"],
  },
  {
    name: "Haryana",
    districts: ["Gurugram", "Faridabad", "Hisar", "Rohtak", "Karnal", "Panipat", "Yamunanagar", "Sonipat", "Ambala", "Bhiwani"],
  },
  {
    name: "Himachal Pradesh",
    districts: ["Shimla", "Dharamshala", "Mandi", "Solan", "Kullu"],
  },
  {
    name: "Jharkhand",
    districts: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh", "Deoghar"],
  },
  {
    name: "Karnataka",
    districts: ["Bengaluru Urban", "Mysuru", "Hubballi-Dharwad", "Mangaluru", "Belagavi", "Kalaburagi", "Davangere", "Shivamogga", "Tumakuru", "Raichur"],
  },
  {
    name: "Kerala",
    districts: ["Thiruvananthapuram", "Kochi (Ernakulam)", "Kozhikode", "Thrissur", "Kollam", "Kannur", "Alappuzha", "Palakkad", "Kottayam", "Malappuram"],
  },
  {
    name: "Madhya Pradesh",
    districts: ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa"],
  },
  {
    name: "Maharashtra",
    districts: ["Mumbai City", "Mumbai Suburban", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Kolhapur", "Navi Mumbai (Raigad)", "Amravati", "Nanded"],
  },
  {
    name: "Manipur",
    districts: ["Imphal West", "Imphal East", "Thoubal", "Bishnupur"],
  },
  {
    name: "Odisha",
    districts: ["Bhubaneswar (Khordha)", "Cuttack", "Rourkela (Sundargarh)", "Berhampur", "Sambalpur", "Balasore", "Puri"],
  },
  {
    name: "Punjab",
    districts: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Phagwara", "Firozpur", "Hoshiarpur"],
  },
  {
    name: "Rajasthan",
    districts: ["Jaipur", "Jodhpur", "Kota", "Udaipur", "Ajmer", "Bikaner", "Alwar", "Bharatpur", "Sikar", "Sri Ganganagar"],
  },
  {
    name: "Tamil Nadu",
    districts: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Erode", "Vellore", "Thanjavur", "Dindigul"],
  },
  {
    name: "Telangana",
    districts: ["Hyderabad", "Warangal", "Karimnagar", "Nizamabad", "Khammam", "Ramagundam", "Nalgonda", "Mahbubnagar", "Secunderabad"],
  },
  {
    name: "Uttar Pradesh",
    districts: ["Lucknow", "Kanpur", "Agra", "Varanasi", "Prayagraj", "Meerut", "Ghaziabad", "Noida (Gautam Buddha Nagar)", "Bareilly", "Aligarh", "Moradabad", "Gorakhpur"],
  },
  {
    name: "Uttarakhand",
    districts: ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Nainital"],
  },
  {
    name: "West Bengal",
    districts: ["Kolkata", "Howrah", "Asansol (Paschim Bardhaman)", "Siliguri (Darjeeling)", "Durgapur", "Bardhaman", "Malda", "Murshidabad", "Medinipur"],
  },
];

export const PLATFORMS = ["Swiggy", "Zomato", "Zepto", "Blinkit", "Ola", "Rapido", "Dunzo", "Porter"];

/** Convert a username like "Felix_shiju" → "Felix Shiju" */
export function usernameToName(username: string): string {
  return username
    .replace(/[_\-.]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}
