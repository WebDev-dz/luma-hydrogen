import {Link} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {Suspense} from 'react';
import {Await} from 'react-router';
import {PaymentMethods} from './Footer/PaymentMethods';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

export default function SiteFooter({
  footer: footerPromise,
  header,
  publicStoreDomain,
}: FooterProps) {
  return (
    <footer className="bg-ink text-background">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        {/* Newsletter — stays as-is, inert for now */}
        <div className="mx-auto max-w-xl text-center">
          <h3 className="font-serif text-3xl">Join the Luma World</h3>
          <p className="mt-3 text-sm text-background/70">
            Subscribe to receive exclusive collection previews, editorial
            stories, and early access to our seasonal edits.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-8 flex flex-col gap-2 sm:flex-row"
          >
            <input
              type="email"
              required
              placeholder="Your email address"
              className="flex-1 rounded-full border border-background/15 bg-transparent px-5 py-3 text-sm text-background placeholder:text-background/40 focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Subscribe
            </button>
          </form>
        </div>

        <div className="mt-20 grid gap-10 border-t border-background/10 pt-12 md:grid-cols-4">
          {/* Brand — copy stays in code (brand content, not catalog data) */}
          <div>
            <div className="font-serif text-2xl tracking-[0.3em]">LUMA</div>
            <p className="mt-4 max-w-xs text-xs leading-relaxed text-background/60">
              Designing for Luminous Living. Curating spaces that inspire quiet
              confidence and effortless luxury.
            </p>
          </div>

          {/* Menu columns — rendered from the Shopify footer menu */}
          <Suspense fallback={<FooterColumnsFallback />}>
            <Await resolve={footerPromise}>
              {(footer) => (
                <FooterMenuColumns
                  menu={footer?.menu}
                  primaryDomainUrl={header.shop.primaryDomain.url}
                  publicStoreDomain={publicStoreDomain}
                />
              )}
            </Await>
          </Suspense>
         
        </div>
         <div className="flex flex-col justify-center lg:grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-line-subtle border-t pt-9 pb-0">
            <div className="text-xs text-background/50 md:text-right">
              © {new Date().getFullYear()} LUMA. Designed for Luminous Living.
            </div>
            <PaymentMethods
              showPaymentMethods={true}
              showMastercard={true}
              showPayPal={true}
              showVisa={true}
              showAmazonPay={false}
              showKlarna={false}
              showGooglePay={false}
              showApplePay={false}
              showJCB={false}
              showAmericanExpress={false}
              showDiners={false}
              showDiscover={false}
              showAlipay={false}
            />
          </div>
      </div>
    </footer>
  );
}

function FooterMenuColumns({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  menu: FooterQuery['menu'];
  primaryDomainUrl: string;
  publicStoreDomain: string;
}) {
  if (!menu) return null;

  return (
    <>
      {menu.items.map((column) => (
        <div key={column.id}>
          <div className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-background/80">
            {column.title}
          </div>
          <ul className="space-y-2 text-sm text-background/60">
            {column.items.map((item) => {
              if (!item.url) return null;
              // Shopify returns absolute URLs; convert internal ones to paths
              const url =
                item.url.includes('myshopify.com') ||
                item.url.includes(publicStoreDomain) ||
                item.url.includes(primaryDomainUrl)
                  ? new URL(item.url).pathname
                  : item.url;
              const isExternal = !url.startsWith('/');
              return (
                <li key={item.id}>
                  {isExternal ? (
                    <a
                      href={url}
                      rel="noopener noreferrer"
                      target="_blank"
                      className="transition-colors hover:text-primary"
                    >
                      {item.title}
                    </a>
                  ) : (
                    <Link
                      to={url}
                      className="transition-colors hover:text-primary"
                    >
                      {item.title}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );
}

function FooterColumnsFallback() {
  return (
    <>
      {[0, 1].map((i) => (
        <div key={i}>
          <div className="mb-4 h-3 w-16 animate-pulse rounded bg-background/15" />
          <ul className="space-y-2">
            {[0, 1, 2, 3].map((j) => (
              <li
                key={j}
                className="h-4 w-24 animate-pulse rounded bg-background/10"
              />
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
