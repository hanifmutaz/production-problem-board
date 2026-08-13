export default function Lightbox({ src, onClose }) {
  if (!src) return null;
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-6"
    >
      <span className="absolute top-5 right-7 cursor-pointer text-4xl leading-none text-white">&times;</span>
      <img src={src} alt="foto problem" className="max-h-[85vh] max-w-[90vw] rounded-xl shadow-2xl" />
    </div>
  );
}
