import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import "./index.css"
import { BrowserRouter } from "react-router-dom"
import { Provider } from "react-redux"
import { store } from './redux/store.jsx'
import { ThemeProvider, createTheme } from "@mui/material/styles"
import AuthInitializer from './components/AuthInitializer.jsx'

// MUI defaults to Roboto; point it at Inter so buttons/inputs match the rest of the UI
const theme = createTheme({ typography: { fontFamily: '"Inter", system-ui, sans-serif' } })

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
  <ThemeProvider theme={theme}>
    <AuthInitializer>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthInitializer>
  </ThemeProvider>
  </Provider>,
)
