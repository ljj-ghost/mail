import { MessageCard } from '../components/PageBits'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function NotFoundPage() {
  useDocumentTitle('页面不存在 | 尊享商城')

  return (
    <MessageCard
      title="页面不存在"
      description="当前访问的地址没有对应页面，你可以先回到商城首页继续浏览。"
      actionLabel="返回首页"
      actionHref="/"
    />
  )
}
