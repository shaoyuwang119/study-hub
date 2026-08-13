export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center gap-1.5 bg-zinc-50">
      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-gray-400" />
      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-gray-400 [animation-delay:200ms]" />
      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-gray-400 [animation-delay:400ms]" />
    </div>
  )
}
