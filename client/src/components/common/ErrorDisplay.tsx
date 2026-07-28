interface ErrorProps {
  message: string
}

function ErrorDisplay({ message }: ErrorProps) {
  return (
    <div className="my-2 w-full rounded-lg border border-red-200 bg-red-50 p-3 text-red-500">
      Error: {message}
    </div>
  )
}

export default ErrorDisplay
