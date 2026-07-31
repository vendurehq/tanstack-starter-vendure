import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Tag} from 'lucide-react';
import {applyPromotionCode, removePromotionCode, type CartActionResult} from './actions';
import {useTranslations} from '@/platform/i18n/paraglide';
import {useServerFn} from '@tanstack/react-start';
import {useRouter} from '@/platform/tanstack/navigation';
import {useState, useTransition} from 'react';

type ActiveOrder = {
    id: string;
    couponCodes?: string[] | null;
};

export function PromotionCode({activeOrder}: { activeOrder: ActiveOrder }) {
    const t = useTranslations('Cart');
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const applyCode = useServerFn(applyPromotionCode);
    const removeCode = useServerFn(removePromotionCode);
    const [error, setError] = useState<string | null>(null);
    const submit = (mutation: () => Promise<CartActionResult>) => startTransition(async () => {
        const result = await mutation();
        await router.refresh();
        setError(result.success ? null : result.message);
    });
    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Tag className="h-5 w-5"/>
                    {t('promotionCode')}
                </CardTitle>
                <CardDescription>
                    {t('enterDiscountCode')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {activeOrder.couponCodes && activeOrder.couponCodes.length > 0 ? (
                    <div className="space-y-2">
                        {activeOrder.couponCodes.map((code) => (
                            <div key={code}
                                 className="flex items-center justify-between p-3 border rounded-md bg-green-50 dark:bg-green-950/20">
                                <div className="flex items-center gap-2">
                                    <Tag className="h-4 w-4 text-green-600"/>
                                    <span className="font-medium text-sm">{code}</span>
                                </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        disabled={isPending}
                                        onClick={() => submit(() => removeCode({data: {code}}))}
                                    >
                                        {t('remove')}
                                    </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>
                        <form onSubmit={(event) => {
                            event.preventDefault();
                            const code = String(new FormData(event.currentTarget).get('code') ?? '');
                            submit(() => applyCode({data: {code}}));
                        }} className="flex gap-2">
                            <Input
                                type="text"
                                name="code"
                                placeholder={t('enterCode')}
                                className="flex-1"
                                required
                            />
                            <Button type="submit" disabled={isPending}>{t('apply')}</Button>
                        </form>
                        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
'use client';
