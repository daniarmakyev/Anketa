import { BrowserRouter, Routes, Route } from "react-router-dom";
import Survey from "./pages/Survey.tsx";
import Admin from "./pages/Admin.tsx";

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Survey />} />
				<Route path="/admin" element={<Admin />} />
			</Routes>
		</BrowserRouter>
	);
}
