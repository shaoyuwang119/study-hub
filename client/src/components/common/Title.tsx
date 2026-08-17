type TitleProps = {
  title: string
  description: string
}

export default function Title({ title, description }: TitleProps) {
  return (
    <div className="mb-6">
      <div className="font-serif text-4xl font-medium text-slate-800">
        {title}
      </div>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  )
}
