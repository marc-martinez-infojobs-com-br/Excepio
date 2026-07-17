'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { CopyButton } from '@components/ui/copy-button';

interface ExceptionUserAgentProps {
  userAgent: string | null | undefined;
}

interface ParsedUserAgent {
  browser: string | null;
  browserVersion: string | null;
  os: string | null;
  osVersion: string | null;
  device: string | null;
}

function parseUserAgent(ua: string): ParsedUserAgent {
  const result: ParsedUserAgent = {
    browser: null,
    browserVersion: null,
    os: null,
    osVersion: null,
    device: null,
  };

  // Parse Browser
  if (ua.includes('Firefox/')) {
    result.browser = 'Firefox';
    const match = ua.match(/Firefox\/([\d.]+)/);
    if (match) result.browserVersion = match[1];
  } else if (ua.includes('Edg/')) {
    result.browser = 'Edge';
    const match = ua.match(/Edg\/([\d.]+)/);
    if (match) result.browserVersion = match[1];
  } else if (ua.includes('Chrome/') && !ua.includes('Chromium/')) {
    result.browser = 'Chrome';
    const match = ua.match(/Chrome\/([\d.]+)/);
    if (match) result.browserVersion = match[1];
  } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
    result.browser = 'Safari';
    const match = ua.match(/Version\/([\d.]+)/);
    if (match) result.browserVersion = match[1];
  } else if (ua.includes('Opera/') || ua.includes('OPR/')) {
    result.browser = 'Opera';
    const match = ua.match(/(?:Opera|OPR)\/([\d.]+)/);
    if (match) result.browserVersion = match[1];
  }

  // Parse OS
  if (ua.includes('Windows NT')) {
    result.os = 'Windows';
    const match = ua.match(/Windows NT ([\d.]+)/);
    if (match) {
      const versions: Record<string, string> = {
        '10.0': '10/11',
        '6.3': '8.1',
        '6.2': '8',
        '6.1': '7',
      };
      result.osVersion = versions[match[1]] || match[1];
    }
  } else if (ua.includes('Mac OS X') && !ua.includes('iPhone') && !ua.includes('iPad')) {
    result.os = 'macOS';
    const match = ua.match(/Mac OS X ([\d_]+)/);
    if (match) result.osVersion = match[1].replace(/_/g, '.');
  } else if (ua.includes('Android')) {
    result.os = 'Android';
    const match = ua.match(/Android ([\d.]+)/);
    if (match) result.osVersion = match[1];
  } else if (ua.includes('iPhone') || ua.includes('iPad')) {
    result.os = 'iOS';
    const match = ua.match(/(?:iPhone OS|CPU OS) ([\d_]+)/);
    if (match) result.osVersion = match[1].replace(/_/g, '.');
  } else if (ua.includes('Linux') && !ua.includes('Android')) {
    result.os = 'Linux';
  }

  // Parse Device
  if (ua.includes('iPhone')) {
    result.device = 'iPhone';
  } else if (ua.includes('iPad')) {
    result.device = 'iPad';
  } else if (ua.includes('Android') && ua.includes('Mobile')) {
    result.device = 'Mobile (Android)';
  } else if (ua.includes('Android') && !ua.includes('Mobile')) {
    result.device = 'Tablet (Android)';
  } else if (ua.includes('Mobile')) {
    result.device = 'Mobile';
  } else {
    result.device = 'Desktop';
  }

  return result;
}

interface InfoRowProps {
  label: string;
  value: string | null;
  notAvailableText: string;
}

function InfoRow({ label, value, notAvailableText }: InfoRowProps) {
  const displayValue = value || notAvailableText;
  const isNotAvailable = !value;

  return (
    <div className="flex justify-between py-2 border-b border-input last:border-b-0">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className={`text-sm ${isNotAvailable ? 'text-muted-foreground italic' : 'text-foreground'}`}>
        {displayValue}
      </span>
    </div>
  );
}

export function ExceptionUserAgent({ userAgent }: ExceptionUserAgentProps) {
  const t = useTranslations('exceptions.detail');
  const { resolvedTheme } = useTheme();
  const notAvailable = t('fields.notAvailable');

  const hasUserAgent = userAgent && userAgent.trim().length > 0;
  const parsed = hasUserAgent ? parseUserAgent(userAgent) : null;

  const containerClass = resolvedTheme === 'dark'
    ? 'border border-input rounded-lg p-4 space-y-1 bg-zinc-800'
    : 'border border-input rounded-lg p-4 space-y-1';

  // Format browser display
  const browserDisplay = parsed?.browser
    ? `${parsed.browser}${parsed.browserVersion ? ` ${parsed.browserVersion}` : ''}`
    : null;

  // Format OS display
  const osDisplay = parsed?.os
    ? `${parsed.os}${parsed.osVersion ? ` ${parsed.osVersion}` : ''}`
    : null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">
        {t('sections.userAgent')}
      </h2>

      {hasUserAgent ? (
        <div className={containerClass}>
          <InfoRow label={t('userAgent.browser')} value={browserDisplay} notAvailableText={notAvailable} />
          <InfoRow label={t('userAgent.os')} value={osDisplay} notAvailableText={notAvailable} />
          <InfoRow label={t('userAgent.device')} value={parsed?.device || null} notAvailableText={notAvailable} />
          
          {/* Raw user agent with copy button */}
          <div className="flex flex-col pt-2 border-t border-input mt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-muted-foreground">{t('userAgent.raw')}</span>
              <CopyButton text={userAgent} label={t('actions.copy')} />
            </div>
            <span className="text-xs text-muted-foreground break-all font-mono">
              {userAgent}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          {notAvailable}
        </p>
      )}
    </div>
  );
}
