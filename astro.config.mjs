// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://ecewo.vercel.app',
	integrations: [
		sitemap(),
		starlight({
			title: 'ecewo',
			logo: {
				src: './public/ecewo.svg',
				replacesTitle: true
			},
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/savashn/ecewo' }],
			sidebar: [
				{
					label: 'Guides',
					items: [
						{ label: 'Introduction', slug: 'docs/introduction' },
						{ label: 'Getting Started', slug: 'docs/getting-started' },
						{ label: 'Handling Requests', slug: 'docs/handling-requests' },
						{ label: 'Using JSON', slug: 'docs/using-json' },
						{ label: 'Using A Database', slug: 'docs/using-a-database' },
						{ label: 'Auth', slug: 'docs/auth' },
						{ label: 'Middleware', slug: 'docs/middleware' },
						{ label: 'Async Operations', slug: 'docs/async-operations' },
						{ label: 'Using CBOR', slug: 'docs/using-cbor' },
						{ label: 'Environment Variables', slug: 'docs/environment-variables' },
						{ label: 'CORS Configuration', slug: 'docs/cors' }
					]
				},
				{
					label: 'API',
					autogenerate: { directory: 'api' }
				},
				{
					label: 'FAQ',
					items: [
						{ label: 'Frequently Asked Questions', slug: 'docs/faq' }
					]
				}
			],
		}),
	],
});
