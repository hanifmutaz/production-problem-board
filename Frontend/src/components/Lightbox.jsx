import { AnimatePresence, motion } from "framer-motion";

export default function Lightbox({ src, onClose }) {
  return (
    <AnimatePresence>
      {src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
          role="dialog"
          aria-modal="true"
          aria-label="Preview foto problem"
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-6"
        >
          <motion.button
            type="button"
            onClick={onClose}
            aria-label="Tutup preview foto"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 0.25 }}
            whileHover={{ scale: 1.2 }}
            className="absolute top-5 right-7 cursor-pointer text-4xl leading-none text-white focus:outline-none focus:ring-2 focus:ring-white/70 rounded"
          >
            &times;
          </motion.button>
          <motion.img
            src={src}
            alt="Foto problem diperbesar"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="max-h-[85vh] max-w-[90vw] rounded-xl shadow-2xl"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
