import { UnknownPageProps } from '$fresh/server.ts'

export default function NotFoundPage({ url }: UnknownPageProps) {
	return <p class="bg-red-200">404 not found: {url.pathname}</p>
}
