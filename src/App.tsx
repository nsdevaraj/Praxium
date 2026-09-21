import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { Catalog } from "./pages/Catalog"
import { Debrief } from "./pages/Debrief"
import { Facilitate, FacilitateHome } from "./pages/Facilitate"
import { Join } from "./pages/Join"
import { Landing } from "./pages/Landing"
import { Play } from "./pages/Play"
import { SimDetail } from "./pages/SimDetail"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/sim/:id" element={<SimDetail />} />
        <Route path="/join" element={<Join />} />
        <Route path="/play/:code" element={<Play />} />
        <Route path="/facilitate" element={<FacilitateHome />} />
        <Route path="/facilitate/:code" element={<Facilitate />} />
        <Route path="/debrief/:code" element={<Debrief />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
