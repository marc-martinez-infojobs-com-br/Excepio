'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useExceptionDetail } from '@hooks/use-exception-detail';
import { Button } from '@components/ui/button';
import { BugSearchingIllustration } from '@components/illustrations/bug-searching';

interface ExceptionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ExceptionDetailPage({ params }: ExceptionDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const tDetail = useTranslations('exceptions.detail');
  const [canGoBack, setCanGoBack] = useState(false);

  const { data: exception, isLoading, isError } = useExceptionDetail(id);

  // Detectar si venimos de nuestra app (hay estado guardado en sessionStorage)
  useEffect(() => {
    const hasIssuesState = sessionStorage.getItem('excepio_issues_state') !== null;
    setCanGoBack(hasIssuesState);
  }, []);

  const handleBack = () => {
    if (canGoBack) {
      router.back();
    } else {
      router.push('/issues');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Error/Not found state
  if (isError || !exception) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex flex-col items-center text-center py-12">
          <BugSearchingIllustration className="w-56 h-56 text-primary mb-6" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {tDetail('notFound')}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            {tDetail('notFoundDescription')}
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
            {tDetail('backToList')}
          </Button>
        </div>
      </div>
    );
  }

  // Success - show message only (no styling yet)
  return (
    <div className="p-4 md:p-6">
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {tDetail('backToList')}
      </button>

      <p>{exception.message}</p>
    </div>
  );
}
