export interface Volunteer {
  id?: string;
  name: string;
  specialty: string;
  location: string;
  availability: string;
}

export interface ClinicNeed {
  id?: string;
  description: string;
  createdAt: string;
}

export interface MatchSuggestion {
  volunteerId: string;
  score: number;
  reason: string;
}
