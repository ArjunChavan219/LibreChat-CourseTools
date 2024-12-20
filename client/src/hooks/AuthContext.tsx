import {
  useMemo,
  useState,
  useEffect,
  ReactNode,
  useContext,
  useCallback,
  createContext,
  useRef,
} from 'react';
import { useRecoilState } from 'recoil';
import { useLocation, useNavigate } from 'react-router-dom';
import { setTokenHeader, SystemRoles } from 'librechat-data-provider';
import {
  useGetUserQuery,
  useLoginUserMutation,
  useRefreshTokenMutation,
} from 'librechat-data-provider/react-query';
import type { TLoginResponse, TLoginUser } from 'librechat-data-provider';
import { TAuthConfig, TUserContext, TAuthContext, TResError } from '~/common';
import { useLogoutUserMutation, useGetRole } from '~/data-provider';
import useTimeout from './useTimeout';
import store from '~/store';

const AuthContext = createContext<TAuthContext | undefined>(undefined);

const AuthContextProvider = ({
  authConfig,
  children,
}: {
  authConfig?: TAuthConfig;
  children: ReactNode;
}) => {
  const [user, setUser] = useRecoilState(store.user);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [courseId, setCourseId] = useState<string | undefined>(undefined);
  const [studentId, setStudentId] = useState<string | undefined>(undefined);
  const [studentName, setStudentName] = useState<string | undefined>(undefined);
  const [isTACourse, setIsTACourse] = useState<boolean | undefined>(undefined);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const isLogoutRef = useRef(false);
  const { data: userRole = null } = useGetRole(SystemRoles.USER, {
    enabled: !!(isAuthenticated && user?.role),
  });

  const navigate = useNavigate();
  const location = useLocation();

  const setUserContext = useCallback(
    (userContext: TUserContext) => {
      const { token, isAuthenticated, user, redirect } = userContext;
      if (user) {
        setUser(user);
      }
      setToken(token);
      //@ts-ignore - ok for token to be undefined initially
      setTokenHeader(token);
      setIsAuthenticated(isAuthenticated);
      
      if (redirect) {
        navigate(redirect, { replace: true });
      }
    },
    [navigate, setUser],
  );
  const doSetError = useTimeout({ callback: (error) => setError(error as string | undefined) });

  const loginUser = useLoginUserMutation();
  const logoutUser = useLogoutUserMutation({
    onSuccess: () => {
      isLogoutRef.current = true;
      setUserContext({
        token: undefined,
        isAuthenticated: false,
        user: undefined,
        redirect: '/login',
      });
    },
    onError: (error) => {
      doSetError((error as Error).message);
      setUserContext({
        token: undefined,
        isAuthenticated: false,
        user: undefined,
        redirect: '/login',
      });
    },
  });

  const logout = useCallback(() => logoutUser.mutate(undefined), [logoutUser]);
  const userQuery = useGetUserQuery({ enabled: !!token });
  const refreshToken = useRefreshTokenMutation();

  const login = (data: TLoginUser) => {
    loginUser.mutate(data, {
      onSuccess: (data: TLoginResponse) => {
        const { user, token } = data;
        setError(undefined);
        setUserContext({ token, isAuthenticated: true, user, redirect: '/c/new' });
        
      },
      onError: (error: TResError | unknown) => {
        const resError = error as TResError;
        doSetError(resError.message);
        navigate('/login', { replace: true });
      },
    });
  };

  const silentRefresh = useCallback(() => {    
    if (authConfig?.test) {
      console.log('Test mode. Skipping silent refresh.');
      return;
    }
    refreshToken.mutate(undefined, {
      onSuccess: (data: TLoginResponse) => {
        const { user, token } = data;
        if (token) {
          setUserContext({ token, isAuthenticated: true, user });
        } else {
          console.log('Token is not present. User is not authenticated.');
          if (authConfig?.test) {
            return;
          }
          
          const queryParams = new URLSearchParams(location.search);
          const courseToken = queryParams.get('courseToken');

          navigate((courseToken && !isLogoutRef.current) ? `/login?courseToken=${courseToken}` : '/login');
          isLogoutRef.current = false;
        }
      },
      onError: (error) => {
        console.log('refreshToken mutation error:', error);
        if (authConfig?.test) {
          return;
        }
        navigate('/login');
      },
    });
  }, []);

  useEffect(() => {
    if (userQuery.data) {
      setUser(userQuery.data);
    } else if (userQuery.isError) {
      doSetError((userQuery?.error as Error).message);
      navigate('/login', { replace: true });
    }
    if (error && isAuthenticated) {
      doSetError(undefined);
    }
    if (!token || !isAuthenticated) {      
      silentRefresh();
    }
  }, [
    token,
    isAuthenticated,
    userQuery.data,
    userQuery.isError,
    userQuery.error,
    error,
    navigate,
    setUserContext,
  ]);

  useEffect(() => {
    const handleTokenUpdate = (event) => {
      console.log('tokenUpdated event received event');
      const newToken = event.detail;
      setUserContext({
        token: newToken,
        isAuthenticated: true,
        user: user,
      });
    };

    window.addEventListener('tokenUpdated', handleTokenUpdate);

    return () => {
      window.removeEventListener('tokenUpdated', handleTokenUpdate);
    };
  }, [setUserContext, user]);

  // Make the provider update only when it should
  const memoedValue = useMemo(
    () => ({
      user,
      token,
      error,
      login,
      logout,
      setError,
      courseId,
      setCourseId,
      studentId,
      setStudentId,
      studentName,
      setStudentName,
      isTACourse,
      setIsTACourse,
      roles: {
        [SystemRoles.USER]: userRole,
      },
      isAuthenticated,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, error, isAuthenticated, token, userRole, courseId, studentId, studentName, isTACourse],
  );

  return <AuthContext.Provider value={memoedValue}>{children}</AuthContext.Provider>;
};

const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuthContext should be used inside AuthProvider');
  }

  return context;
};

export { AuthContextProvider, useAuthContext };
