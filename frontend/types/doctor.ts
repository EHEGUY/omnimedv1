export interface Doctor {
  id: string
  name: string
  photo: string
  designation: string        // e.g. "MBBS, MD (Dermatology)"
  specialization: string     // e.g. "Dermatology"
  hospital: string
  experience_years: number
  nmc_registration: string   // e.g. "MH-12345"
  languages: string[]        // e.g. ["English", "Hindi", "Marathi"]
  consultation_fee: number   // in INR
  available: boolean
  rating: number             // 0.0 - 5.0
  reviews_count: number
}
