import { Helmet } from 'react-helmet-async'

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://feralwear.com'
const DEFAULT_IMAGE = `${SITE_URL}/logo1.jpeg`

/**
 * SEOHead — drop this into any page to set title, description, OG tags, and
 * optional JSON-LD structured data for product pages.
 *
 * @param {string}  title       - Page-specific title (appended with "| F3RAL")
 * @param {string}  description - Meta description
 * @param {string}  image       - Absolute URL for OG image
 * @param {string}  path        - URL path (e.g. "/shop"), used to build canonical
 * @param {string}  type        - OG type: "website" | "product"
 * @param {object}  productData - If provided, injects JSON-LD Product schema
 */
const SEOHead = ({
  title,
  description = 'Technical streetwear. Unapologetically f3ral. Shop the latest drops from F3RAL — built in the dark, worn in the wild.',
  image = DEFAULT_IMAGE,
  path = '',
  type = 'website',
  productData = null,
}) => {
  const fullTitle = title ? `${title} | F3RAL` : 'F3RAL — Technical Streetwear'
  const canonical = `${SITE_URL}${path}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="F3RAL" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD structured data — product pages only */}
      {productData && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: productData.name,
            description: productData.description,
            image: productData.images,
            brand: { '@type': 'Brand', name: 'F3RAL' },
            offers: {
              '@type': 'Offer',
              price: productData.price,
              priceCurrency: import.meta.env.VITE_CURRENCY || 'NGN',
              availability: productData.preorder
                ? 'https://schema.org/PreOrder'
                : 'https://schema.org/InStock',
              url: canonical,
            },
          })}
        </script>
      )}
    </Helmet>
  )
}

export default SEOHead
