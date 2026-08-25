import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { defineConfig, devices } from '@playwright/test';
function installedChromium(){if(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE)return process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;const cache=join(homedir(),'.cache','ms-playwright');if(!existsSync(cache))return undefined;for(const directory of readdirSync(cache).filter(name=>name.startsWith('chromium-')).reverse()){const executable=join(cache,directory,'chrome-linux','chrome');if(existsSync(executable))return executable}return undefined}
export default defineConfig({testDir:'./e2e',outputDir:'test-results',fullyParallel:true,retries:0,reporter:'line',use:{baseURL:'http://localhost:3000',screenshot:'only-on-failure',trace:'retain-on-failure',...devices['Desktop Chrome'],launchOptions:{executablePath:installedChromium()}},webServer:{command:'npm run dev -- --hostname 127.0.0.1',url:'http://localhost:3000',reuseExistingServer:!process.env.CI,timeout:120_000}});
