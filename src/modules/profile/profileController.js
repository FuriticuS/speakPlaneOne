import { getProfile as getProfileService, updateProfile as updateProfileService } from './profileService.js';

const getProfile = async (req, res, next) => {
  try {
    const user = await getProfileService(req.user.id);
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await updateProfileService(req.user.id, req.validatedBody || req.body);
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

export { getProfile, updateProfile };
