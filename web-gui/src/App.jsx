import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import MainMenu from "./pages/MainMenu";
import FormEditing from "./pages/FormEditing";
import FormCreator from "./pages/FormCreator";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/*' element={<MainMenu />} />
          <Route path='/form/:form_id' element={<FormEditing />} />
          <Route path='/form/new' element={<FormCreator />} />
        </Routes>
      </BrowserRouter>

      <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored" />
    </>
  )
}

export default App
