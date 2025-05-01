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
						{ label: 'Route Handling', slug: 'docs/route-handling' },
						{ label: 'Handling Requests', slug: 'docs/handling-requests' },
						{ label: 'Using cJSON', slug: 'docs/using-cjson' },
						{ label: 'Using A Database', slug: 'docs/using-a-database' },
						{ label: 'Authentication', slug: 'docs/authentication' }
					]
				}
			],
		}),
	],
});
