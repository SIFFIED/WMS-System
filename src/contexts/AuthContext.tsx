import React, { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/api/auth';

// 认证上下文类型
interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  login: (account: string, password: string, dynamicId: string, dynamicCode: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: any) => void;
  tempLogin: () => void;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: async () => false,
  logout: () => { },
  setUser: () => { },
  tempLogin: () => { },
});

// 创建认证上下文提供者组件
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 在组件挂载时验证token
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const isValid = await authService.tokenAuth();
        setIsAuthenticated(isValid);
      } catch (error) {
        console.error('Token验证失败:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  // 登录方法
  const login = async (
    account: string,
    password: string,
    dynamicId: string,
    dynamicCode: string
  ): Promise<boolean> => {
    try {
      const res = await authService.login({
        account,
        password,
        dynamicId,
        dynamicCode,
      });

      if (res.success) {
        setIsAuthenticated(true);
        setUser(res.data.target);
        return true;
      }
      return false;
    } catch (error) {
      console.error('登录失败:', error);
      return false;
    }
  };

  // 临时登录方法 - 不需要验证，直接设置登录状态
  const tempLogin = () => {
    setIsAuthenticated(true);
    setUser({ name: '临时用户', tempUser: true });
    setLoading(false);
  };

  // 登出方法
  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  // 提供认证上下文值
  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    setUser,
    tempLogin,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// 创建使用认证上下文的钩子
export const useAuth = () => useContext(AuthContext);

export default AuthContext; 