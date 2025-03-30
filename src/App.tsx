import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router';
import Main from './main/Main.tsx';
import { Settings } from './settings/Settings.tsx';


const router = createBrowserRouter([
    {
        path: '/',
        element: <Main/>,
    },
    {
        path: '/settings',
        element: <Settings/>,
    },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <RouterProvider router={router}/>
    </React.StrictMode>,
);
