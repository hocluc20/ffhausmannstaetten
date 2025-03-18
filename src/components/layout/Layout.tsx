import Box from "@mui/material/Box";
import Footer from "../footer/Footer";
import {Outlet} from "react-router-dom";
import Header from "../header/Header";


const Layout = () => {
    return (
        <div>
            <header style={{position: 'sticky', top: 0, zIndex: 1000, filter: "drop-shadow(0px 3px 9px #000000)",  // Adjusted drop shadow
            }}>
                <Header/></header>

            {/*<Box sx={{ marginTop: '80px', marginLeft: '40px', marginRight: '40px' }}>*/}

                <Outlet/>
                <footer style={{marginTop: '80px', filter: "drop-shadow(0px -3px 9px #000000)"}}>
                    <Footer/>
                </footer>


        </div>
    );
};

export default Layout;