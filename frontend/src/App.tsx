import { BrowserRouter,Routes, Route } from "react-router-dom";
import InterviewRoom from "./pages/InterviewRoom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/interview/:roomId" element={<InterviewRoom />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;