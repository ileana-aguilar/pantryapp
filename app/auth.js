"use client";

import React, { useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import * as firebaseui from 'firebaseui'; 
import { auth } from '@/firebase';

const Auth = () => {
  useEffect(() => {
    
    const uiConfig = {
      signInOptions: [
        {
          provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
          signInMethod: firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,
        },
      ],
      signInSuccessUrl: '/', 

    };

  
    const ui =
      firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);
    ui.start('#firebaseui-auth-container', uiConfig);

    return () => {
      ui.reset();
    };
  }, []);

  return (
    <div>
      <h1>Sign In</h1>
      <div id="firebaseui-auth-container"></div>
    </div>
  );
};

export default Auth;
