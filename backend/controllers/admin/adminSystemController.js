import {
  getOrInitializeSystemConfig,
  getAllAdminsService,
  createAdminService,
  toggleAdminStatusService,
  resetAdminPasswordService,
  getRolesMatrixService,
  updateRolesMatrixService,
  getDepartmentsConfigService,
  addDepartmentConfigService,
  updateDepartmentConfigService,
  getCategoriesConfigService,
  addCategoryConfigService,
  toggleCategoryStatusService,
  getWardsConfigService,
  addWardConfigService,
  toggleWardStatusService,
  getTemplatesConfigService,
  updateTemplateConfigService,
  getSystemPreferencesService,
  updateSystemPreferencesService,
  getSecurityDashboardService,
  getMaintenanceOverviewService
} from "../../services/admin/adminSystemService.js";

// @desc    Get complete Platform Administration overview (Preferences, Configs, Security, Maintenance)
// @route   GET /api/admin/system/overview
// @access  Private/Super-Admin
export const getPlatformOverview = async (req, res) => {
  try {
    const config = await getOrInitializeSystemConfig();
    const security = await getSecurityDashboardService();
    const maintenance = await getMaintenanceOverviewService();

    res.status(200).json({
      success: true,
      preferences: config.preferences,
      departments: config.departments,
      categories: config.categories,
      wards: config.wards,
      roles: config.roles,
      templates: config.templates,
      security,
      maintenance
    });
  } catch (error) {
    console.error("Error fetching system overview:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= PHASE 2: ADMIN ACCOUNTS =================
export const getAllAdmins = async (req, res) => {
  try {
    const result = await getAllAdminsService(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const newAdmin = await createAdminService(req.body);
    res.status(201).json({ success: true, admin: newAdmin });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const toggleAdminStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const admin = await toggleAdminStatusService(req.params.id, isActive);
    res.status(200).json({ success: true, admin });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const resetAdminPassword = async (req, res) => {
  try {
    const result = await resetAdminPasswordService(req.params.id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ================= PHASE 3: ROLES MATRIX =================
export const updateRolesMatrix = async (req, res) => {
  try {
    const roles = await updateRolesMatrixService(req.body.roles);
    res.status(200).json({ success: true, roles });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ================= PHASE 4: DEPARTMENTS CONFIG =================
export const addDepartmentConfig = async (req, res) => {
  try {
    const departments = await addDepartmentConfigService(req.body);
    res.status(201).json({ success: true, departments });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateDepartmentConfig = async (req, res) => {
  try {
    const departments = await updateDepartmentConfigService(req.params.id, req.body);
    res.status(200).json({ success: true, departments });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ================= PHASE 5: CATEGORIES & WARDS CONFIG =================
export const addCategoryConfig = async (req, res) => {
  try {
    const categories = await addCategoryConfigService(req.body);
    res.status(201).json({ success: true, categories });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const toggleCategoryStatus = async (req, res) => {
  try {
    const categories = await toggleCategoryStatusService(req.params.id, req.body.isActive);
    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const addWardConfig = async (req, res) => {
  try {
    const wards = await addWardConfigService(req.body);
    res.status(201).json({ success: true, wards });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const toggleWardStatus = async (req, res) => {
  try {
    const wards = await toggleWardStatusService(req.params.id, req.body.status);
    res.status(200).json({ success: true, wards });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ================= PHASE 6: TEMPLATES ADMINISTRATION =================
export const updateTemplateConfig = async (req, res) => {
  try {
    const template = await updateTemplateConfigService(req.params.templateKey, req.body);
    res.status(200).json({ success: true, template });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ================= PHASE 7: SYSTEM PREFERENCES =================
export const updateSystemPreferences = async (req, res) => {
  try {
    const preferences = await updateSystemPreferencesService(req.body);
    res.status(200).json({ success: true, preferences });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
