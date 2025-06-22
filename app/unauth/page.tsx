'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState,useLayoutEffect } from 'react';
import { Suspense } from 'react';

const UnauthContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [message, setMessage] = useState('');
    const [redirectPath, setRedirectPath] = useState('');

    useLayoutEffect(() => {
        // Capture parameters first
        const msg = searchParams.get('msg') || 'You have an authentication issue.';
        const redirect = searchParams.get('redirect');
        
        setMessage(msg);
        if (redirect) {
            setRedirectPath(redirect);
            
            // Set up redirection timer
            const timer = setTimeout(() => {
                router.push(redirect);
            }, 5000); // Redirect after 5 seconds
            
            // Clean up timer if component unmounts
            return () => clearTimeout(timer);
        }

        // Clear URL immediately
        window.history.replaceState({}, '', '/unauth');
      }, []);
    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>{message}</h1>
            {redirectPath && <p>You are being redirected to: {redirectPath}</p>}
        </div>
    );
};
 
const UnauthPage=()=>{
    return(
        <Suspense fallback={<div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>}>
            <UnauthContent></UnauthContent>
        </Suspense>
    )
}

export default UnauthPage;