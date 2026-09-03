export interface DemoArea {
  id: string;
  label: string;
  zone: string;
  ward: string;
  lat: number;
  lng: number;
  x: number;
  y: number;
}

export const DEMO_CITY = {
  id: "chennai-south-demo",
  name: "South Chennai Demo Corridor",
  state: "Tamil Nadu",
};

export const DEMO_AREAS: DemoArea[] = [
  { id: "adyar", label: "Adyar", zone: "Zone 13", ward: "Ward 175", lat: 13.0067, lng: 80.2573, x: 66, y: 58 },
  { id: "besant_nagar", label: "Besant Nagar", zone: "Zone 13", ward: "Ward 179", lat: 12.9983, lng: 80.2667, x: 74, y: 63 },
  { id: "thiruvanmiyur", label: "Thiruvanmiyur", zone: "Zone 13", ward: "Ward 182", lat: 12.983, lng: 80.2594, x: 70, y: 70 },
  { id: "velachery", label: "Velachery", zone: "Zone 13", ward: "Ward 170", lat: 12.9791, lng: 80.2212, x: 46, y: 72 },
  { id: "mandaveli", label: "Mandaveli", zone: "Zone 10", ward: "Ward 126", lat: 13.0275, lng: 80.2677, x: 76, y: 48 },
  { id: "mylapore", label: "Mylapore", zone: "Zone 9", ward: "Ward 122", lat: 13.0338, lng: 80.2673, x: 76, y: 42 },
  { id: "triplicane", label: "Triplicane", zone: "Zone 9", ward: "Ward 117", lat: 13.0569, lng: 80.2755, x: 82, y: 34 },
  { id: "t_nagar", label: "T. Nagar", zone: "Zone 10", ward: "Ward 134", lat: 13.0418, lng: 80.2341, x: 56, y: 38 },
  { id: "kodambakkam", label: "Kodambakkam", zone: "Zone 10", ward: "Ward 134", lat: 13.0521, lng: 80.2215, x: 48, y: 31 },
  { id: "saidapet", label: "Saidapet", zone: "Zone 10", ward: "Ward 141", lat: 13.023, lng: 80.2237, x: 49, y: 50 },
  { id: "guindy", label: "Guindy", zone: "Zone 12", ward: "Ward 158", lat: 13.0105, lng: 80.2122, x: 41, y: 56 },
  { id: "nungambakkam", label: "Nungambakkam", zone: "Zone 8", ward: "Ward 109", lat: 13.0604, lng: 80.2422, x: 61, y: 24 },
];

