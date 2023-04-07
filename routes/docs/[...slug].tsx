import { Head } from '$fresh/runtime.ts'
import { Handlers, PageProps } from '$fresh/server.ts'
import { frontMatter, gfm } from '@/utils/markdown.ts'

import { SLUGS, TABLE_OF_CONTENTS, TableOfContentsEntry } from '@/data/docs.ts'

interface Data {
	page: Page
}

interface Page extends TableOfContentsEntry {
	markdown: string
	data: Record<string, unknown>
}

export const handler: Handlers<Data> = {
	async GET(_req, ctx) {
		const slug = ctx.params.slug

		if (slug === '') {
			return new Response('', {
				status: 307,
				headers: { location: '/docs/welcome' },
			})
		}

		if (slug === 'mac') {
			return new Response('', {
				status: 307,
				headers: { location: '/docs/macintosh' },
			})
		}

		const entry = TABLE_OF_CONTENTS[slug]
		if (!entry) {
			return ctx.renderNotFound()
		}

		const url = new URL(`../../${entry.file}`, import.meta.url)
		const fileContent = await Deno.readTextFile(url)
		const { body, attrs } = frontMatter<Record<string, unknown>>(fileContent)
		const page = { ...entry, markdown: body, data: attrs ?? {} }
		const resp = ctx.render({ page })
		return resp
	},
}

function Content(props: { page: Page }) {
	const html = gfm.render(props.page.markdown)
	return (
		<main class='py-6 overflow-hidden'>
			<h1 class='text(4xl gray-900) tracking-tight font-extrabold mt-6'>
				{props.page.title}
			</h1>
			<div
				class='mt-6 markdown-body'
				dangerouslySetInnerHTML={{ __html: html }}
			/>
		</main>
	)
}

export default function DocsPage(props: PageProps<Data>) {
	let description

	if (props.data.page.data.description) {
		description = String(props.data.page.data.description)
	}

	return (
		<>
			<Head>
				<title>
					{props.data.page?.title ?? 'Not Found'} | fresh docs
				</title>
				{description && <meta name='description' content={description} />}
			</Head>
			<div class='flex flex-col min-h-screen'>
				<Content page={props.data.page} />
			</div>
		</>
	)
}
