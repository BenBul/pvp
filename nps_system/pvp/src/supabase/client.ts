import { type Session, UserResponse, createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export let session : Session | undefined = undefined;

//TODO: Maybe will be needed later on app init
// export const init = async () => {
//     const { data } = await supabase.auth.getSession() as any;
//     session = data.session;
// };

export const getSession = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session;
}

export const getUser = async () => {
    const { data } = await supabase.auth.getUser() as UserResponse;
    return data;
}

supabase.auth.onAuthStateChange((_, _session) => {
    session = _session as any;
});

// export const loginWithGoogle = async () => {
//     const { error } = await supabase.auth.signInWithOAuth({
//       provider: 'google',
//     });
  
//     if (error) {
//       console.error('Error during Google Sign-In:', error.message);
//     } else {
//       console.log('Google Sign-In initiated.');
//     }
//   };


export const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
};

export const getUserName = async () => {
    if (!session) {
        return;
    }

    const { data } = await supabase
        .from('users')
        .select('name')
        .eq('id', session.user.id)
        .maybeSingle();

    if (data) {
        setCachedName(data.name);
        return data.name;
    }
};

let cachedName: string | undefined = undefined;

// Getter for cachedName
export const getCachedName = (): string | undefined => cachedName;

// Setter for cachedName
export const setCachedName = (name: string | undefined): void => {
    cachedName = name;
};