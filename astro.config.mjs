// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'ecewo v0.11.0',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/savashn/ecewo' }],
			sidebar: [
				{
					label: 'Guides',
					items: [
						{ label: 'Introduction', slug: 'docs/introduction' },
						{ label: 'Installation', slug: 'docs/installation' },
						{ label: 'Route Handling', slug: 'docs/route-handling' },
						{ label: 'Handling Requests', slug: 'docs/handling-requests' },
						{ label: 'Using cJSON', slug: 'docs/using-cjson' },
						{ label: 'Using A Database', slug: 'docs/using-a-database' },
						{ label: 'Authentication', slug: 'docs/authentication' }
					]
				},
				// {
				// 	label: 'API',
				// 	autogenerate: { directory: 'api' }
				// },
				// {
				// 	label: 'Examples',
				// 	autogenerate: { directory: 'examples' }
				// }
			],
		}),
	],
});
