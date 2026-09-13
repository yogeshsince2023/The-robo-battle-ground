import { z } from "zod";

// Accepts either a raw string (a number <input> registered via react-hook-form's
// `register`, without valueAsNumber, submits its string value — "" when blank)
// or an already-numeric value (when this same schema re-validates a payload a
// client already transformed client-side, or a direct API call sends JSON
// numbers). `.optional()` as the outermost wrapper is required for zod v4 to
// treat the key as omittable when the object key is entirely absent.
const optionalPositiveInt = () =>
  z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === undefined || v === "" ? undefined : Number(v)))
    .refine((v) => v === undefined || (Number.isInteger(v) && v > 0), {
      message: "Must be a positive whole number",
    });

export const arenaEnquirySchema = z.object({
  name: z.string().min(2, "Name is required").max(120),
  company: z.string().max(160).optional().or(z.literal("")),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter a valid phone number").max(20),
  eventName: z.string().max(160).optional().or(z.literal("")),
  eventDate: z.string().optional().or(z.literal("")),
  participants: optionalPositiveInt(),
  robotCategory: z.string().max(300).optional().or(z.literal("")),
  expectedRobots: optionalPositiveInt(),
  arenaDuration: z.string().max(120).optional().or(z.literal("")),
  location: z.string().max(200).optional().or(z.literal("")),
  message: z.string().max(2000).optional().or(z.literal("")),
});

export const trainingEnquirySchema = z.object({
  studentName: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  organization: z.string().max(160).optional().or(z.literal("")),
  courseId: z.string().optional().or(z.literal("")),
  preferredBatch: z.string().max(120).optional().or(z.literal("")),
  trainingMode: z.string().max(60).optional().or(z.literal("")),
  message: z.string().max(2000).optional().or(z.literal("")),
});

export const contactMessageSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(20).optional().or(z.literal("")),
  subject: z.string().max(160).optional().or(z.literal("")),
  message: z.string().min(5, "Message is too short").max(3000),
});

export const machiningRequestSchema = z.object({
  name: z.string().min(2).max(120),
  company: z.string().max(160).optional().or(z.literal("")),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  serviceType: z.enum(["CNC", "VMC", "3D Printing"]),
  material: z.string().max(160).optional().or(z.literal("")),
  quantity: optionalPositiveInt(),
  requiredDeliveryDate: z.string().optional().or(z.literal("")),
  tolerance: z.string().max(300).optional().or(z.literal("")),
  instructions: z.string().max(2000).optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const certificateVerifySchema = z.object({
  certificateId: z.string().min(3).max(60),
});

export const ALLOWED_UPLOAD_EXTENSIONS = [
  ".step",
  ".stp",
  ".iges",
  ".igs",
  ".stl",
  ".obj",
  ".dxf",
  ".dwg",
  ".pdf",
  ".zip",
];

export const MAX_UPLOAD_FILES = 5;
export const MAX_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024; // 25MB per file
