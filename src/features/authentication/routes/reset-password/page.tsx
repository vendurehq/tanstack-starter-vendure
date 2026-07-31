import { ResetPasswordForm } from './reset-password-form';

export default function ResetPasswordPage({token}: {token?: string}) {
    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto">
                <ResetPasswordForm token={token} />
            </div>
        </div>
    );
}
