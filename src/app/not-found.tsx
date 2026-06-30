import { ErrorDisplay } from '@/components/ErrorDisplay'

export default function NotFound() {
  const notFoundError = new Error('The page you are looking for does not exist or has been moved.')
  return <ErrorDisplay error={notFoundError} statusCode={404} />
}