import { registerUser, loginUser, refreshUserToken, getUserById, logoutUser } from '../services/authService.js';
import { AppError } from '../utils/appError.js';

const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const data = await loginUser(req.body);

    res.cookie('refreshToken', data.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: data.user, accessToken: data.accessToken });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const data = await refreshUserToken(refreshToken);

    res.cookie('refreshToken', data.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: data.user, accessToken: data.accessToken });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    await logoutUser(refreshToken);
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out' });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      throw new AppError('Unauthorized', 401);
    }

    const user = await getUserById(req.user.id);
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export { register, login, refresh, logout, me };
