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
					label: 'Getting Started',
					items: [
						{ label: 'Introduction', slug: 'docs/introduction' },
						{ label: 'Installation', slug: 'docs/installation' },
						{ label: 'Start Server', slug: 'docs/start-server' }
					]
				},
				{
					label: 'Guides',
					items: [
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
