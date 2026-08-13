import { usePageTitle } from '@/lib/usePageTitle'

function NotFound() {
  usePageTitle('404 Not Found | StudyNote')
  return <div>404 page not found.</div>
}

export default NotFound
