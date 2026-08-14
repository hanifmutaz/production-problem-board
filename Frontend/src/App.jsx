import { Navigate, Route, Routes, useParams } from "react-router-dom";
import BoardPage from "./pages/BoardPage";
import { VENUES, slugToVenue, venueToSlug } from "./api/problems";

// Wrapper: baca slug dari URL, validasi, render BoardPage per venue.
// Kalau slug gak dikenal -> lempar ke venue pertama.
function VenueRoute() {
  const { venueSlug } = useParams();
  const venue = slugToVenue(venueSlug);
  if (!venue) return <Navigate to={`/${venueToSlug(VENUES[0])}`} replace />;
  return <BoardPage venue={venue} />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${venueToSlug(VENUES[0])}`} replace />} />
      <Route path="/:venueSlug" element={<VenueRoute />} />
      <Route path="*" element={<Navigate to={`/${venueToSlug(VENUES[0])}`} replace />} />
    </Routes>
  );
}
