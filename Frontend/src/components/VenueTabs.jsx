import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { VENUES, venueToSlug } from "../api/problems";

export default function VenueTabs({ active }) {
  return (
    <div className="border-b border-slate-200 bg-white no-print">
      <div className="mx-auto flex max-w-[1600px] gap-1 px-6">
        {VENUES.map((v) => {
          const isActive = v === active;
          return (
            <NavLink
              key={v}
              to={`/${venueToSlug(v)}`}
              className="relative px-4 py-3 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800"
              style={{ color: isActive ? "#1f3a5f" : undefined }}
            >
              {v}
              {isActive && (
                <motion.div
                  layoutId="venue-underline"
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-navy"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
