import mongoose, { Schema, Document } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/weather-app';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = { bufferCommands: false };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => mongoose);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// MongoDB Schemas

// User Profile Schema
export interface IProfile extends Document {
  _id: string;
  email: string;
  full_name: string;
  phone?: string;
  is_active: boolean;
  role: 'farm_owner' | 'farm_manager' | 'veterinarian' | 'worker' | 'accountant' | 'customer';
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

const ProfileSchema = new Schema<IProfile>({
  email: { type: String, required: true, unique: true },
  full_name: { type: String, required: true },
  phone: { type: String },
  is_active: { type: Boolean, default: true },
  role: {
    type: String,
    enum: ['farm_owner', 'farm_manager', 'veterinarian', 'worker', 'accountant', 'customer'],
    default: 'customer'
  },
  password_hash: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Saved Cities Schema
export interface ISavedCity extends Document {
  _id: string;
  user_id: string;
  city_name: string;
  country_code: string;
  state_code?: string;
  latitude: number;
  longitude: number;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}

const SavedCitySchema = new Schema<ISavedCity>({
  user_id: { type: String, required: true, ref: 'Profile' },
  city_name: { type: String, required: true },
  country_code: { type: String, required: true },
  state_code: { type: String },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  is_default: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// User Preferences Schema
export interface IUserPreferences extends Document {
  _id: string;
  user_id: string;
  theme: string;
  language: string;
  temperature_unit: string;
  wind_speed_unit: string;
  notifications_enabled: boolean;
  daily_forecast_push: boolean;
  severe_weather_alerts: boolean;
  default_city_id?: string;
  created_at: Date;
  updated_at: Date;
}

const UserPreferencesSchema = new Schema<IUserPreferences>({
  user_id: { type: String, required: true, unique: true, ref: 'Profile' },
  theme: { type: String, default: 'system' },
  language: { type: String, default: 'en' },
  temperature_unit: { type: String, default: 'celsius' },
  wind_speed_unit: { type: String, default: 'kmh' },
  notifications_enabled: { type: Boolean, default: true },
  daily_forecast_push: { type: Boolean, default: false },
  severe_weather_alerts: { type: Boolean, default: true },
  default_city_id: { type: String, ref: 'SavedCity' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Create indexes for better performance
SavedCitySchema.index({ user_id: 1, latitude: 1, longitude: 1 }, { unique: true });
UserPreferencesSchema.index({ user_id: 1 });

// Export models
export const Profile =
  mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);
export const SavedCity =
  mongoose.models.SavedCity || mongoose.model<ISavedCity>('SavedCity', SavedCitySchema);
export const UserPreferences =
  mongoose.models.UserPreferences || mongoose.model<IUserPreferences>('UserPreferences', UserPreferencesSchema);