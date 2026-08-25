import { getServices } from '../lib/services';

async function main() {
  const urls = [
    ...new Set(
      getServices().flatMap((service) => [
        service.officialUrl,
        ...service.sources.map((source) => source.url),
      ]),
    ),
  ];
  let failed = 0;

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: AbortSignal.timeout(10_000),
      });
      if (response.status >= 400) {
        console.error(response.status, url);
        failed += 1;
      }
    } catch (error) {
      console.error('ERR', url, String(error));
      failed += 1;
    }
  }

  console.log(`Checked ${urls.length} URLs; ${failed} failed`);
  if (failed) process.exitCode = 1;
}

void main();
