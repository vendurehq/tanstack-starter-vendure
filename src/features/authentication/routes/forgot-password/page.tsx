import { ForgotPasswordForm } from './forgot-password-form';

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <ForgotPasswordForm />
            </div>
        </div>
    );
}
