import {VerifyContent} from './verify-content';

type VerifyResult = {success: boolean; error?: undefined} | {error: string; success?: undefined};

export default function VerifyPage({token, result}: {token?: string; result: VerifyResult | null}) {
    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-md space-y-6">
                <VerifyContent token={token} result={result}/>
            </div>
        </div>
    );
}
