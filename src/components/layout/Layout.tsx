import Box from "@mui/material/Box";
import Footer from "../footer/Footer";
import {Outlet} from "react-router-dom";
import Header from "../header/Header";


const Layout = () => {
    return (
        <div>
            <header style={{position: 'sticky', top: 0, zIndex: 1000}}><Header/></header>

            {/*<Box sx={{ marginTop: '80px', marginLeft: '40px', marginRight: '40px' }}>*/}

            <Outlet/>

            <footer style={{marginTop: '80px'}}>
                <Footer/>
            </footer>

        </div>
    );
};

export default Layout;