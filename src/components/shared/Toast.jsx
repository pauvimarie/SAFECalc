export default function Toast({ message }) {
  return (
    <div className="fixed bottom-12 left-1/2 transform -translate-x-1/2 px-5 py-3 rounded-full bg-emerald-500 text-black font-semibold text-[14px] shadow-lg animate-fadeIn">
      {message}
    </div>
  )
}
