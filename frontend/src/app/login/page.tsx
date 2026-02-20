import { Suspense } from 'react';
import AuthContainer from '@/components/auth/AuthContainer';

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}>
            <AuthContainer />
        </Suspense>
    );
}