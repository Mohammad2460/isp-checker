import { SERVICES } from './services';

export interface CheckResult {
  serviceName: string;
  serviceUrl: string;
  isBlocked: boolean;
  responseTimeMs: number | null;
}

async function checkService(name: string, url: string): Promise<CheckResult> {
  const start = Date.now();
  try {
    await fetch(url, {
      mode: 'no-cors',
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    });
    return {
      serviceName: name,
      serviceUrl: url,
      isBlocked: false,
      responseTimeMs: Date.now() - start,
    };
  } catch {
    return {
      serviceName: name,
      serviceUrl: url,
      isBlocked: true,
      responseTimeMs: null,
    };
  }
}

export async function runAllChecks(
  onProgress?: (name: string, result: CheckResult) => void
): Promise<CheckResult[]> {
  const promises = SERVICES.map(async (service) => {
    const result = await checkService(service.name, service.url);
    onProgress?.(service.name, result);
    return result;
  });

  return Promise.all(promises);
}
