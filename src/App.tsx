import React from 'react';

import {APIProvider, useAPI} from "./common/context/DataContext";
import Home from "./common/views/Home";

function App() {


    return (
        <APIProvider>
          <Home/>
        </APIProvider>
    );
}

export default App;
