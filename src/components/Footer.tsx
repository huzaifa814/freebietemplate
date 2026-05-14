import Link from 'next/link';
import { siteConfig, navConfig } from '@/config/site';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-slate-800 mt-24">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ background: siteConfig.brandColor }}>{siteConfig.name[0]}</span>
              <span>{siteConfig.name}</span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">{siteConfig.description}</p>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3">Templates</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {navConfig.main.map((item) => <li key={item.href}><Link href={item.href} className="hover:text-gray-900 dark:hover:text-white transition">{item.title}</Link></li>)}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3">Site</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {navConfig.footer.map((item) => <li key={item.href}><Link href={item.href} className="hover:text-gray-900 dark:hover:text-white transition">{item.title}</Link></li>)}
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <a href="https://www.pdfshed.com" className="hover:text-gray-900 dark:hover:text-white">PDFShed</a>
            <a href="https://www.pixshed.com" className="hover:text-gray-900 dark:hover:text-white">PixShed</a>
            <a href="https://www.resumeshed.com" className="hover:text-gray-900 dark:hover:text-white">ResumeShed</a>
            <a href="https://www.simplycalcs.com" className="hover:text-gray-900 dark:hover:text-white">SimplyCalcs</a>
            <a href="https://www.insurecalcs.com" className="hover:text-gray-900 dark:hover:text-white">InsureCalcs</a>
            <a href="https://www.retirecalcs.com" className="hover:text-gray-900 dark:hover:text-white">RetireCalcs</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
