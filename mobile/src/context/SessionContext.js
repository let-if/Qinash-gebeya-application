import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SessionContext = createContext({
  token: null,
  user: null,
  lang: 'am',
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  setLanguage: () => {},
});

export function SessionProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState('am');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStoredSession() {
      try {
        const storedToken = await AsyncStorage.getItem('b2b_token');
        const storedUser = await AsyncStorage.getItem('b2b_user');
        const storedLang = await AsyncStorage.getItem('b2b_lang');

        if (storedToken) setToken(storedToken);
        if (storedUser) setUser(JSON.parse(storedUser));
        if (storedLang) setLang(storedLang);
      } catch (err) {
        console.log('Failed to load session:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStoredSession();
  }, []);

  const signIn = async (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    try {
      await AsyncStorage.setItem('b2b_token', newToken);
      await AsyncStorage.setItem('b2b_user', JSON.stringify(newUser));
    } catch (err) {
      console.log('Failed to save session:', err);
    }
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
    try {
      await AsyncStorage.removeItem('b2b_token');
      await AsyncStorage.removeItem('b2b_user');
    } catch (err) {
      console.log('Failed to clear session:', err);
    }
  };

  const setLanguage = async (newLang) => {
    setLang(newLang);
    try {
      await AsyncStorage.setItem('b2b_lang', newLang);
    } catch (err) {
      console.log('Failed to save language:', err);
    }
  };

  return (
    <SessionContext.Provider
      value={{
        token,
        user,
        lang,
        loading,
        signIn,
        signOut,
        setLanguage,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
// import React, { createContext, useContext, useEffect, useState } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const SessionContext = createContext({
//   token: null,
//   user: null,
//   lang: 'am',
//   loading: true,
//   signIn: async () => {},
//   signOut: async () => {},
//   setLanguage: async () => {},
//   login: async () => {},
//   logout: async () => {},
//   changeLanguage: async () => {},
//   updateUser: async () => {},
// });

// // ✅ MUST BE: { children } with curly braces!
// export function SessionProvider({ children }) {
//   const [token, setToken] = useState(null);
//   const [user, setUser] = useState(null);
//   const [lang, setLang] = useState('am');
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function loadStoredSession() {
//       try {
//         const [storedToken, storedUser, storedLang] = await Promise.all([
//           AsyncStorage.getItem('b2b_token'),
//           AsyncStorage.getItem('b2b_user'),
//           AsyncStorage.getItem('b2b_lang'),
//         ]);

//         if (storedToken) setToken(storedToken);

//         if (storedUser) {
//           try {
//             setUser(JSON.parse(storedUser));
//           } catch {
//             setUser(null);
//           }
//         }

//         if (storedLang) setLang(storedLang);
//       } catch {
//         // Silent recovery
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadStoredSession();
//   }, []);

//   const signIn = async (newToken, newUser) => {
//     setToken(newToken);
//     setUser(newUser);
//     try {
//       if (newToken) await AsyncStorage.setItem('b2b_token', newToken);
//       if (newUser) await AsyncStorage.setItem('b2b_user', JSON.stringify(newUser));
//     } catch {}
//   };

//   const signOut = async () => {
//     setToken(null);
//     setUser(null);
//     try {
//       await AsyncStorage.multiRemove(['b2b_token', 'b2b_user', 'user_cart', 'user_draft_cart']);
//     } catch {}
//   };

//   const setLanguage = async (newLang) => {
//     setLang(newLang);
//     try {
//       await AsyncStorage.setItem('b2b_lang', newLang);
//     } catch {}
//   };

//   const updateUser = async (updatedData) => {
//     setUser((prev) => {
//       const merged = { ...prev, ...updatedData };
//       AsyncStorage.setItem('b2b_user', JSON.stringify(merged)).catch(() => {});
//       return merged;
//     });
//   };

//   return (
    
//       {children}
    
//   );
// }

// export function useSession() {
//   const ctx = useContext(SessionContext);
//   if (!ctx) {
//     return {
//       token: null,
//       user: null,
//       lang: 'am',
//       loading: false,
//       signIn: async () => {},
//       signOut: async () => {},
//       setLanguage: async () => {},
//       login: async () => {},
//       logout: async () => {},
//       changeLanguage: async () => {},
//       updateUser: async () => {},
//     };
//   }
//   return ctx;
// }