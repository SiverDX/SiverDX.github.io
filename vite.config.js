import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import html from '@rollup/plugin-html'
import config from './src/config.json'
import { env } from 'process'
import copy from 'rollup-plugin-copy'
import English from './src/locales/en.json'

export default defineConfig({
	build: {
		sourcemap: true,
		rollupOptions: {
			plugins: [
				html({
					fileName: `404.html`,
					title: '404',
					template: template,
				}),
				...config.generators.map(m => html({
					fileName: `${m.id}/index.html`,
					title: getTitle(m),
					template: template,
				})),
				copy({
					targets: [
						{ src: 'src/sitemap.txt', dest: 'dist' },
						{ src: 'src/sitemap.txt', dest: 'dist', rename: 'sitemap2.txt' },
					],
					hook: 'writeBundle'
				})
			],
		},
	},
	json: {
		stringify: true,
	},
	define: {
		__MCDATA_MASTER_HASH__: env.mcdata_hash,
		__VANILLA_DATAPACK_SUMMARY_HASH__: env.vanilla_datapack_summary_hash,
	},
	plugins: [preact()],
})

function getTitle(m) {
	const minVersion = Math.max(0, config.versions.findIndex(v => m.minVersion === v.id))
	const versions = config.versions.slice(minVersion).map(v => v.id)
	versions.splice(0, versions.length - 3)
	return `${English[m.id] ?? ''} Generator${m.category === true ? 's' : ''} Minecraft ${versions.join(', ')}`
}

function template({ files, title }) {
	const source = files.html.find(f => f.fileName === 'index.html').source
	return source.replace(/<title>.*<\/title>/, `<title>${title}</title>`)
}
