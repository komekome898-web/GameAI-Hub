import Script from "next/script";

export const measurementId = "G-B9Q283QVER";
export const canonicalAnalyticsHost = "game-ai-hub.vercel.app";
export const analyticsExclusionKey = "gameai:analytics-excluded";
export const analyticsExclusionParameter = "gameai_analytics";
export const analyticsPendingCommandCapacity = 32;
export const analyticsLoadTimeoutMs = 10_000;

export function isPublicProductionDeployment(environment = process.env.VERCEL_ENV) {
  return environment === "production";
}

export function isAnalyticsEligible(deploymentEligible: boolean, hostname: string, excluded: boolean) {
  return deploymentEligible && hostname === canonicalAnalyticsHost && !excluded;
}

/** Fail-closed bootstrap: deployment, exact host and exclusion are resolved before any Google request. */
export function analyticsBootstrap(deploymentEligible: boolean) {
  return `(()=>{const MID=${JSON.stringify(measurementId)},HOST=${JSON.stringify(canonicalAnalyticsHost)},KEY=${JSON.stringify(analyticsExclusionKey)},PARAM=${JSON.stringify(analyticsExclusionParameter)},CAP=${analyticsPendingCommandCapacity},TIMEOUT=${analyticsLoadTimeoutMs};let excluded=false;const url=new URL(location.href);const command=url.searchParams.get(PARAM);try{if(command==='off')localStorage.setItem(KEY,'1');if(command==='on')localStorage.removeItem(KEY);excluded=localStorage.getItem(KEY)==='1'}catch(_){excluded=command==='off'}if(command==='off'||command==='on'){url.searchParams.delete(PARAM);history.replaceState(history.state,'',url.pathname+(url.searchParams.toString()?'?'+url.searchParams.toString():'')+url.hash)}const eligible=${JSON.stringify(deploymentEligible)}&&location.hostname===HOST&&!excluded;window.__gameAIAnalyticsEligible=eligible;window.__gameAIAnalyticsExcluded=excluded;if(!eligible){delete window.gtag;if(!window.__gameAIAnalyticsLoaded)delete window.dataLayer;return}if(window.__gameAIAnalyticsInitialized)return;window.__gameAIAnalyticsInitialized=true;window.__gameAIAnalyticsLoaded=false;window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){const queue=window.dataLayer;if(!queue)return;if(window.__gameAIAnalyticsLoaded!==true&&queue.length>=CAP)queue.splice(2,1);queue.push(arguments)};window.gtag('js',new Date());window.gtag('config',MID);if(!document.querySelector('script[data-gameai-ga]')){const script=document.createElement('script');let settled=false;script.async=true;script.dataset.gameaiGa='true';script.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(MID);const dispose=()=>{if(settled)return;settled=true;clearTimeout(timer);script.remove();window.__gameAIAnalyticsEligible=false;delete window.gtag;delete window.dataLayer};script.onload=()=>{if(settled){delete window.gtag;delete window.dataLayer;return}settled=true;clearTimeout(timer);window.__gameAIAnalyticsLoaded=true};script.onerror=dispose;const timer=setTimeout(dispose,TIMEOUT);document.head.appendChild(script)}})();`;
}

export function GoogleAnalytics() {
  // App Router root layouts are the documented location for beforeInteractive.
  // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
  return <Script id="gameai-ga-bootstrap" strategy="beforeInteractive">{analyticsBootstrap(isPublicProductionDeployment())}</Script>;
}
