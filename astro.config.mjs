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
			title: 'Ecewo',
			logo: {
				src: './public/ecewo.svg',
				replacesTitle: true
			},
			customCss: [
				'./src/styles/style.css',
			],
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/savashn/ecewo' }],
			sidebar: [
				{
					label: 'Guides',
					items: [
						{ label: 'Getting Started', slug: 'docs/getting-started' },
						{ label: 'Handling Requests', slug: 'docs/handling-requests' },
						{ label: 'Cookie', slug: 'docs/cookie' },
						{ label: 'Middleware', slug: 'docs/middleware' },
						{ label: 'Async Operations', slug: 'docs/async-operations' },
						{ label: 'CORS Configuration', slug: 'docs/cors' }
					]
				},
				{
					label: 'Examples',
					items: [
						{ label: 'Using JSON', slug: 'examples/using-json' },
						{ label: 'Using A Database', slug: 'examples/using-a-database' },
						{ label: 'Authentication', slug: 'examples/auth' },
						{ label: 'Environment Variables', slug: 'examples/environment-variables' },
						{ label: 'Using CBOR', slug: 'examples/using-cbor' }
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
