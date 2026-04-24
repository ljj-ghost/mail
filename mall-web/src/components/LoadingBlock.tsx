export function LoadingBlock({
  label = '正在加载内容...',
}: {
  label?: string
}) {
  return (
    <div className="loading-block">
      <div className="loading-block__bar" />
      <div className="loading-block__bar loading-block__bar--short" />
      <span>{label}</span>
    </div>
  )
}
