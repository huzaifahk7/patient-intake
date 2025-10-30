//This file starts your React app.
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render( //It finds the <div id="root"> in the HTML page and puts your app there

  //It turns on routing so you can have pages (URLs) without reloading
  
  <React.StrictMode> 
    <BrowserRouter>                                          
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
