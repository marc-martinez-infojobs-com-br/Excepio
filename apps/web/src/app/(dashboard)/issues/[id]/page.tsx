'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useExceptionDetail } from '@hooks/use-exception-detail';
import { Button } from '@components/ui/button';
import { BugSearchingIllustration } from '@components/illustrations/bug-searching';
import { ExceptionDetailHeader } from '@components/exceptions/exception-detail-header';
import { ExceptionStackTrace } from '@components/exceptions/exception-stack-trace';
import { ExceptionMetadata } from '@components/exceptions/exception-metadata';
import { ExceptionContext } from '@components/exceptions/exception-context';
import { ExceptionUserAgent } from '@components/exceptions/exception-user-agent';

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

  // Success
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {tDetail('backToList')}
      </button>

      {/* Header */}
      <ExceptionDetailHeader exception={exception} />

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Stack Trace & Metadata */}
        <div className="lg:col-span-2 space-y-6">
          <ExceptionStackTrace stackTrace={exception.stackTrace} />
          <ExceptionMetadata metadata={exception.metadata} />
        </div>

        {/* Right column - Context & User Agent */}
        <div className="lg:col-span-1 space-y-6">
          <ExceptionContext exception={exception} />
          <ExceptionUserAgent userAgent={exception.userAgent} />
        </div>
      </div>
    </div>
  );
}
