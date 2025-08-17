import { useRoutes } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
// project import
import LoginRoutes from './LoginRoutes';
import MainRoutes from './MainRoutes';

// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
        
    return useRoutes([ LoginRoutes,MainRoutes]);
}
