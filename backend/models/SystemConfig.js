import mongoose from "mongoose";

const systemConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "GLOBAL_SYSTEM_CONFIG"
    },

    // Phase 7: System Preferences
    preferences: {
      applicationName: { type: String, default: "Fix My Ward — Municipal Portal" },
      municipalityName: { type: String, default: "Coimbatore Municipal Corporation" },
      timezone: { type: String, default: "IST - UTC+05:30" },
      dateFormat: { type: String, default: "DD/MM/YYYY" },
      themeDefault: { type: String, enum: ["Dark", "Light", "System"], default: "Dark" },
      sessionTimeout: { type: Number, default: 60 }, // minutes
      defaultPagination: { type: Number, default: 15 },
      autoRefreshInterval: { type: Number, default: 25 }, // seconds
      maintenanceMode: { type: Boolean, default: false },
      readOnlyMode: { type: Boolean, default: false }
    },

    // Phase 4: Department Configuration
    departments: [
      {
        name: { type: String, required: true },
        color: { type: String, default: "blue" },
        description: { type: String, default: "" },
        contact: { type: String, default: "" },
        head: { type: String, default: "" },
        isActive: { type: Boolean, default: true }
      }
    ],

    // Phase 5: Issue Categories Configuration
    categories: [
      {
        name: { type: String, required: true },
        description: { type: String, default: "" },
        isActive: { type: Boolean, default: true }
      }
    ],

    // Phase 5: Municipal Wards Configuration
    wards: [
      {
        wardName: { type: String, required: true },
        wardNumber: { type: String, required: true },
        zone: { type: String, default: "Central Zone" },
        status: { type: String, enum: ["Active", "Disabled"], default: "Active" }
      }
    ],

    // Phase 3: Roles & Permissions Matrix
    roles: [
      {
        roleName: { type: String, required: true },
        description: { type: String, default: "" },
        permissions: [{ type: String }],
        modulesAccessible: [{ type: String }],
        isSystemDefault: { type: Boolean, default: false }
      }
    ],

    // Phase 6: Notification Template Administration
    templates: [
      {
        templateKey: { type: String, required: true },
        name: { type: String, required: true },
        category: { type: String, default: "General Communication" },
        recipient: { type: String, enum: ["Citizen", "Admin", "Department", "Broadcast"], default: "Citizen" },
        subject: { type: String, default: "" },
        content: { type: String, required: true },
        variables: [{ type: String }],
        isActive: { type: Boolean, default: true },
        version: { type: Number, default: 1 }
      }
    ]
  },
  { timestamps: true }
);

const SystemConfig = mongoose.model("SystemConfig", systemConfigSchema);
export default SystemConfig;
