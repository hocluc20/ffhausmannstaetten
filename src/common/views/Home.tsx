/**
 * author: simon
 * date: 29.11.2024
 * project: ffhausmannstaetten
 * package_name:
 **/

import React from 'react';
import {useAPI} from "../context/DataContext";

const Home = () => {
    const {categories} = useAPI()
    return (
        <div>
            {categories.map(category => (category.name))}
        </div>
    );
};

export default Home;