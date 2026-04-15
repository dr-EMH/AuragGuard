export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  emergencyContacts: EmergencyContact[];
  settings: {
    fallDetectionEnabled: boolean;
    routeDeviationEnabled: boolean;
    countdownDuration: number; // in seconds
  };
}

export interface Alert {
  id: string;
  userId: string;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
  };
  type: 'fall' | 'deviation' | 'manual';
  status: 'active' | 'resolved';
}

export interface TransitSession {
  id: string;
  userId: string;
  destination: {
    latitude: number;
    longitude: number;
    address: string;
  };
  startTime: string;
  status: 'active' | 'completed' | 'cancelled';
}
