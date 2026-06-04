import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).blogs._index';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import type {BlogsQuery} from 'storefrontapi.generated';
import {ArrowRight, BookOpen, Newspaper} from 'lucide-react';
import EmptyState from '~/components/EmptyState';

type BlogNode = BlogsQuery['blogs']['nodes'][0];

export const meta: Route.MetaFunction = () => {
  return [{title: `Luma | Blogs`}];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 10,
  });

  const [{blogs}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        ...paginationVariables,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {blogs};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Blogs() {
  const {blogs} = useLoaderData<typeof loader>();

  return (
    <div>
      {/* Page Header */}
      <div className="border-b border-border bg-cream/60">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Read
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h1 className="font-serif text-5xl leading-tight text-foreground lg:text-6xl">
              Our Blogs
            </h1>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-right">
              Explore our journals — stories, guides, and ideas curated for curious minds.
            </p>
          </div>
        </div>
      </div>

      {/* Blogs Grid */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
        <PaginatedResourceSection<BlogNode>
          connection={blogs}
          resourcesClassName="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {({node: blog, index}) => (
            <BlogCard key={blog.handle} blog={blog} index={index} />
          )}
        </PaginatedResourceSection>

        {blogs.nodes.length === 0 && (
          <EmptyState
            title="No blogs yet"
            body="Our writers are preparing the first stories. Please check back soon."
          />
        )}
      </section>
    </div>
  );
}

const ACCENT_COLORS = [
  'from-indigo-50 to-indigo-100/60',
  'from-amber-50 to-amber-100/60',
  'from-rose-50 to-rose-100/60',
  'from-emerald-50 to-emerald-100/60',
  'from-sky-50 to-sky-100/60',
  'from-violet-50 to-violet-100/60',
];

function BlogCard({blog, index}: {blog: BlogNode; index: number}) {
  const gradient = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const Icon = index % 2 === 0 ? BookOpen : Newspaper;

  return (
    <Link
      to={`/blogs/${blog.handle}`}
      prefetch="intent"
      className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-background transition-shadow duration-300 hover:shadow-md"
    >
      {/* Decorative top band */}
      <div className={`h-36 bg-linear-to-br ${gradient} flex items-center justify-center`}>
        <Icon className="h-12 w-12 text-foreground/20 transition-transform duration-500 group-hover:scale-110" strokeWidth={1} />
        <span className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-[10px] font-medium text-foreground backdrop-blur-sm">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        {blog.seo?.description && (
          <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {blog.seo.description}
          </p>
        )}
        <h2 className="font-serif text-2xl leading-snug text-foreground">{blog.title}</h2>
        <span className="mt-auto pt-5 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground transition-all duration-300 group-hover:gap-2.5 group-hover:text-foreground">
          Read articles
          <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOGS_QUERY = `#graphql
  query Blogs(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    blogs(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        title
        handle
        seo {
          title
          description
        }
      }
    }
  }
` as const;
