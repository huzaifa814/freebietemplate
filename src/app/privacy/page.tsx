import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { siteConfig } from '@/config/site';

export const metadata = { title: 'Privacy Policy', description: `Privacy policy for ${siteConfig.name}.` };

export default function Privacy() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        <div className="prose dark:prose-invert max-w-none space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>{siteConfig.name} ({siteConfig.domain}) takes a minimal approach to data. We do not require accounts or collect personal information.</p>

          <h2 className="text-2xl font-bold mt-6 mb-2">What we collect</h2>
          <p>Nothing personally identifiable. We do not run a custom analytics tracker, we do not have a newsletter list, and there are no login forms.</p>

          <h2 className="text-2xl font-bold mt-6 mb-2">Third-party services</h2>
          <p><strong>Google AdSense:</strong> AdSense serves contextual ads on our pages and uses cookies to do so. AdSense may collect anonymized usage data; see Google&apos;s <a href="https://policies.google.com/privacy" className="text-amber-600 dark:text-amber-400 hover:underline">privacy policy</a> for details. You can manage personalized advertising at <a href="https://adssettings.google.com" className="text-amber-600 dark:text-amber-400 hover:underline">adssettings.google.com</a>.</p>
          <p><strong>Google Docs/Sheets:</strong> When you click a &quot;Make a copy&quot; link, Google opens the template in your Google account. We never see that copy and Google&apos;s terms apply once you are in their app.</p>

          <h2 className="text-2xl font-bold mt-6 mb-2">Hosting</h2>
          <p>This site is served from a static CDN. Server logs (IP, user-agent, requested URL) are retained briefly for abuse prevention and then discarded.</p>

          <h2 className="text-2xl font-bold mt-6 mb-2">Contact</h2>
          <p>Questions about this policy? Email <a href={`mailto:${siteConfig.email}`} className="text-amber-600 dark:text-amber-400 hover:underline">{siteConfig.email}</a>.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
